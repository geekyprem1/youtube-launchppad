import { NextRequest, NextResponse } from "next/server";
import { processRecommendations } from "@/domains/recommendations/service";
import { RecommendationRequestSchema } from "@/domains/recommendations/types";
import { createClient } from "@/lib/supabase/server";
import { checkLimit, incrementUsage } from "@/lib/planLimits";
import { UPGRADE_MESSAGES } from "@/lib/plans";
import { logError } from "@/core/logger";

// Extend Vercel timeout to 60s (free tier max)
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsedRequest = RecommendationRequestSchema.safeParse(body);

    if (!parsedRequest.success) {
      return NextResponse.json({ error: "Invalid request payload", details: parsedRequest.error }, { status: 400 });
    }

    // Check plan limits before doing AI work (non-fatal if the check itself errors)
    try {
      const { allowed } = await checkLimit(user.id, "ideas_per_day");
      if (!allowed) {
        const msg = UPGRADE_MESSAGES.ideas_per_day || "Daily idea limit reached. Please upgrade your plan.";
        return NextResponse.json({ error: msg }, { status: 403 });
      }
    } catch (limitErr) {
      console.error("[RecommendationsAPI] checkLimit failed (non-fatal):", limitErr);
    }

    // Process using the Domain Service Orchestrator
    const result = await processRecommendations(parsedRequest.data);

    // Persist usage + history (non-fatal)
    try {
      await incrementUsage(user.id, "ideas_per_day");
    } catch (usageErr) {
      console.error("[RecommendationsAPI] incrementUsage failed (non-fatal):", usageErr);
    }
    try {
      await supabase.from("ideas").insert({
        user_id: user.id,
        niche: parsedRequest.data.niche,
        ideas: result.ideas,
      });
    } catch (dbErr) {
      console.error("[RecommendationsAPI] DB insert failed (non-fatal):", dbErr);
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("[RecommendationsAPI] Fatal error:", err);
    logError("RecommendationsAPI", err);
    return NextResponse.json({ error: "Failed to generate recommendations" }, { status: 500 });
  }
}
