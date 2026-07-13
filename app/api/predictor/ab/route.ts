import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { denyUnlessFeature } from "@/lib/requireFeature";
import { processABTest } from "@/domains/prediction/service";
import { ABTestRequestSchema } from "@/domains/prediction/types";
import { logError } from "@/core/logger";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const denied = await denyUnlessFeature(user.id, "predictor");
    if (denied) return denied;

    const body = await req.json();
    const parsed = ABTestRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    if (parsed.data.variant_a.trim() === parsed.data.variant_b.trim()) {
      return NextResponse.json(
        { error: "Option A and B must be different" },
        { status: 400 }
      );
    }

    const result = await processABTest(parsed.data);

    // Best-effort history (reuse predictions table if present)
    try {
      await supabase.from("predictions").insert({
        user_id: user.id,
        topic: parsed.data.topic || `ab:${parsed.data.mode}`,
        title: `A/B | A: ${parsed.data.variant_a.slice(0, 80)} | B: ${parsed.data.variant_b.slice(0, 80)}`,
        results: result,
      });
    } catch {
      // non-fatal
    }

    return NextResponse.json(result);
  } catch (err) {
    logError("PredictorABAPI", err);
    return NextResponse.json(
      { error: "Failed to run A/B simulation" },
      { status: 500 }
    );
  }
}
