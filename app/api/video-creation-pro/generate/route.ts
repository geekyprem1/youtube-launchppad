import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { denyUnlessFeature } from "@/lib/requireFeature";
import { createPrediction } from "@/core/replicate";
import { getCreditState, aiVideoGate, spendAiVideoClips } from "@/lib/credits";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const denied = await denyUnlessFeature(user.id, "video_creation_pro");
    if (denied) return denied;

    const body = await req.json();
    const { videoType, prompt } = body;

    if (!videoType || !prompt?.trim()) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const model = process.env.REPLICATE_VIDEO_MODEL;
    if (!model) {
      return NextResponse.json({ error: "REPLICATE_VIDEO_MODEL not configured" }, { status: 500 });
    }

    // AI video is a real per-clip cost (~$0.20 for 10s 720p). Hard-cap by clip pool — never unlimited.
    const creditState = await getCreditState(user.id);
    const vGate = aiVideoGate(creditState.aiVideoCredits, 1);
    if (!vGate.ok) {
      return NextResponse.json({ error: vGate.error }, { status: vGate.status });
    }

    const aspectRatio = videoType === "long" ? "16:9" : "9:16";

    // 10-second 720p render → $0.02/sec × 10 = $0.20 per clip.
    const prediction = await createPrediction({
      prompt,
      aspect_ratio: aspectRatio,
      duration: 10,
      resolution: "720p",
    });

    // Reserve the clip now that the prediction started successfully.
    await spendAiVideoClips(user.id, 1, creditState.aiVideoCredits);

    const { data: saved, error: dbError } = await supabase
      .from("video_engine_pro_generations")
      .insert({
        user_id: user.id,
        video_type: videoType,
        topic: prompt,
        enhanced_prompt: prompt,
        replicate_prediction_id: prediction.id,
        status: prediction.status,
        model_name: model,
      })
      .select("id")
      .single();

    if (dbError) throw dbError;

    return NextResponse.json({
      ok: true,
      id: saved.id,
      predictionId: prediction.id,
      status: prediction.status,
    });

  } catch (error: any) {
    console.error("Video Creation Pro Generate API Error:", error);
    return NextResponse.json(
      { error: "Failed to start video generation", details: error.message },
      { status: 500 }
    );
  }
}
