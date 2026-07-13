import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { denyUnlessFeature } from "@/lib/requireFeature";
import { processUploadChecklist } from "@/domains/rankpilot/service";
import { UploadChecklistRequestSchema } from "@/domains/rankpilot/types";
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

    const denied = await denyUnlessFeature(user.id, "optimize");
    if (denied) return denied;

    const body = await req.json();
    const parsed = UploadChecklistRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const result = await processUploadChecklist(parsed.data);

    // Best-effort history in title_scores if table exists
    try {
      await supabase.from("title_scores").insert({
        user_id: user.id,
        title: `[RankPilot] ${parsed.data.title.slice(0, 100)}`,
        result,
      });
    } catch {
      // non-fatal
    }

    return NextResponse.json(result);
  } catch (err) {
    logError("RankPilotChecklistAPI", err);
    return NextResponse.json(
      { error: "Failed to run RankPilot checklist" },
      { status: 500 }
    );
  }
}
