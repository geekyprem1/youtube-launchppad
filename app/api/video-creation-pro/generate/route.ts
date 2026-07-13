import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { denyUnlessFeature } from "@/lib/requireFeature";
import { createPrediction } from "@/core/replicate";

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

    const aspectRatio = videoType === "long" ? "16:9" : "9:16";

    const prediction = await createPrediction({ prompt, aspect_ratio: aspectRatio });

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
