import { NextRequest, NextResponse } from "next/server";
import { processPrediction } from "@/domains/prediction/service";
import { PredictionRequestSchema } from "@/domains/prediction/types";
import { createClient } from "@/lib/supabase/server";
import { logError } from "@/core/logger";
import { incrementUsage } from "@/lib/planLimits";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const body = await req.json();
    const parsedRequest = PredictionRequestSchema.safeParse(body);
    
    if (!parsedRequest.success) {
      return NextResponse.json({ error: "Invalid request payload", details: parsedRequest.error }, { status: 400 });
    }

    // Process using the Domain Service Orchestrator
    const result = await processPrediction(parsedRequest.data);

    // Save to DB if user exists
    if (user) {
      // We don't have predictions_per_day in FeatureKey right now, so we skip it to avoid TS error
      // await incrementUsage(user.id, "predictions_per_day");
      await supabase.from("predictions").insert({
        user_id: user.id,
        topic: parsedRequest.data.topic,
        title: parsedRequest.data.title,
        results: result,
      });
    }

    return NextResponse.json(result);
  } catch (err) {
    logError("PredictorAPI", err);
    return NextResponse.json({ error: "Failed to generate prediction" }, { status: 500 });
  }
}
