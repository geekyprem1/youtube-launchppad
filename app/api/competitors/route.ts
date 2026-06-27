import { NextRequest, NextResponse } from "next/server";
import { processCompetitor } from "@/domains/competitors/service";
import { CompetitorRequestSchema } from "@/domains/competitors/types";
import { createClient } from "@/lib/supabase/server";
import { logError } from "@/core/logger";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const body = await req.json();
    const parsedRequest = CompetitorRequestSchema.safeParse(body);
    
    if (!parsedRequest.success) {
      return NextResponse.json({ error: "Invalid request payload", details: parsedRequest.error }, { status: 400 });
    }

    // Process using the Domain Service Orchestrator
    const result = await processCompetitor(parsedRequest.data);

    // Save to DB if user exists
    if (user) {
      await supabase.from("competitors").insert({
        user_id: user.id,
        channel_url: parsedRequest.data.channelUrl,
        results: result,
      });
    }

    return NextResponse.json(result);
  } catch (err) {
    logError("CompetitorsAPI", err);
    return NextResponse.json({ error: "Failed to generate competitor intel" }, { status: 500 });
  }
}
