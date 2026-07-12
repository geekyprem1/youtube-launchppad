import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPrediction, extractVideoUrl } from "@/core/replicate";

export async function GET(
  req: Request,
  { params }: { params: { predictionId: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const prediction = await getPrediction(params.predictionId);
    const videoUrl = extractVideoUrl(prediction.output);
    const isDone = ["succeeded", "failed", "canceled"].includes(prediction.status);

    if (isDone) {
      await supabase
        .from("video_engine_pro_generations")
        .update({
          status: prediction.status,
          video_url: prediction.status === "succeeded" ? videoUrl : null,
          error_message: prediction.error,
          completed_at: new Date().toISOString(),
        })
        .eq("replicate_prediction_id", params.predictionId)
        .eq("user_id", user.id);
    }

    return NextResponse.json({
      ok: true,
      status: prediction.status,
      videoUrl: prediction.status === "succeeded" ? videoUrl : null,
      error: prediction.error,
    });

  } catch (error: any) {
    console.error("Video Creation Pro Status API Error:", error);
    return NextResponse.json({ error: "Failed to check generation status" }, { status: 500 });
  }
}
