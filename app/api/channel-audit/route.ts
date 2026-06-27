import { NextRequest, NextResponse } from "next/server";
import { processDiagnostics } from "@/domains/diagnostics/service";
import { DiagnosticRequestSchema } from "@/domains/diagnostics/types";
import { createClient } from "@/lib/supabase/server";
import { checkLimit, incrementUsage } from "@/lib/planLimits";
import { logError } from "@/core/logger";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const body = await req.json();
    const parsedRequest = DiagnosticRequestSchema.safeParse(body);
    
    if (!parsedRequest.success) {
      return NextResponse.json({ error: "Invalid request payload", details: parsedRequest.error }, { status: 400 });
    }

    // Process using the Domain Service Orchestrator
    const result = await processDiagnostics(parsedRequest.data);

    // Save to DB if user exists
    if (user) {
      await supabase.from("audits").insert({
        user_id: user.id,
        channel_url: parsedRequest.data.channelUrl,
        results: result,
      });
    }

    return NextResponse.json(result);
  } catch (err) {
    logError("DiagnosticsAPI", err);
    return NextResponse.json({ error: "Failed to generate diagnostics" }, { status: 500 });
  }
}
