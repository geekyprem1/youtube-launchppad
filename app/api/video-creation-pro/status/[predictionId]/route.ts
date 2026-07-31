import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPrediction, extractVideoUrl } from "@/core/replicate";
import { denyUnlessFeature } from "@/lib/requireFeature";
import { persistRemoteVideoSafe } from "@/lib/persistRemoteVideo";

export async function GET(
  req: Request,
  { params }: { params: { predictionId: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const denied = await denyUnlessFeature(user.id, "video_creation_pro");
    if (denied) return denied;

    // If already finalized + persisted, return the stored permanent URL (avoid
    // re-downloading / duplicate uploads on repeated polls).
    const { data: existing } = await supabase
      .from("video_engine_pro_generations")
      .select("status, video_url")
      .eq("replicate_prediction_id", params.predictionId)
      .eq("user_id", user.id)
      .single();

    if (existing?.status === "succeeded" && existing.video_url) {
      return NextResponse.json({
        ok: true,
        status: "succeeded",
        videoUrl: existing.video_url,
        error: null,
      });
    }

    const prediction = await getPrediction(params.predictionId);
    const tempVideoUrl = extractVideoUrl(prediction.output);
    const isDone = ["succeeded", "failed", "canceled"].includes(prediction.status);
    const succeeded = prediction.status === "succeeded" && !!tempVideoUrl;

    // On success, re-host the Replicate output on Supabase Storage so the link
    // stays alive after Replicate deletes the temporary prediction output.
    let finalVideoUrl = succeeded ? tempVideoUrl : null;
    if (succeeded && tempVideoUrl) {
      const { url } = await persistRemoteVideoSafe(supabase, user.id, tempVideoUrl);
      finalVideoUrl = url;
    }

    if (isDone) {
      await supabase
        .from("video_engine_pro_generations")
        .update({
          status: prediction.status,
          video_url: finalVideoUrl,
          error_message: prediction.error,
          completed_at: new Date().toISOString(),
        })
        .eq("replicate_prediction_id", params.predictionId)
        .eq("user_id", user.id);
    }

    return NextResponse.json({
      ok: true,
      status: prediction.status,
      videoUrl: finalVideoUrl,
      error: prediction.error,
    });

  } catch (error: any) {
    console.error("Video Creation Pro Status API Error:", error);
    return NextResponse.json({ error: "Failed to check generation status" }, { status: 500 });
  }
}
