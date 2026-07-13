import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { denyUnlessFeature } from "@/lib/requireFeature";
import { processProfit } from "@/domains/profit/service";
import { ProfitRequestSchema } from "@/domains/profit/types";
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

    const denied = await denyUnlessFeature(user.id, "profit");
    if (denied) return denied;

    const body = await req.json();
    const parsed = ProfitRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const result = await processProfit(parsed.data);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    logError("ProfitAPI", err);
    return NextResponse.json(
      { error: "Failed to run Profit Accelerator" },
      { status: 500 }
    );
  }
}
