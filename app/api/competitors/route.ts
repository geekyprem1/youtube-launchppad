import { NextRequest, NextResponse } from "next/server";
import { processCompetitor } from "@/domains/competitors/service";
import { CompetitorRequestSchema } from "@/domains/competitors/types";
import { createClient } from "@/lib/supabase/server";
import { logError } from "@/core/logger";
import { denyUnlessFeature } from "@/lib/requireFeature";
import { normalizeChannelInput } from "@/lib/youtube";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const denied = await denyUnlessFeature(user.id, "competitors");
    if (denied) return denied;

    const body = await req.json();
    const parsedRequest = CompetitorRequestSchema.safeParse(body);

    if (!parsedRequest.success) {
      return NextResponse.json(
        { error: "Invalid request payload", details: parsedRequest.error },
        { status: 400 }
      );
    }

    const channelUrl = normalizeChannelInput(parsedRequest.data.channelUrl);
    const result = await processCompetitor({ channelUrl });

    // Save to DB (non-fatal)
    try {
      await supabase.from("competitors").insert({
        user_id: user.id,
        channel_url: channelUrl,
        channel_name: (result as any).metrics?.channel_name ?? null,
        channel_id: (result as any).metrics?.channel_id ?? null,
        result: result,
      });
    } catch (dbErr) {
      console.error("[Competitors] DB save failed (non-fatal):", dbErr);
    }

    return NextResponse.json(result);
  } catch (err) {
    logError("CompetitorsAPI", err);
    const message = err instanceof Error ? err.message : "Failed to generate competitor intel";
    const isClient =
      /not found|parse channel|API key|No uploads/i.test(message) ||
      /YouTube API error: 4\d\d/.test(message);
    return NextResponse.json(
      { error: message },
      { status: isClient ? 400 : 500 }
    );
  }
}
