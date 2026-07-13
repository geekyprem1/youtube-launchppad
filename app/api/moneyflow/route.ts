import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { denyUnlessFeature } from "@/lib/requireFeature";
import { processMoneyflow } from "@/domains/moneyflow/service";
import { MoneyflowRequestSchema } from "@/domains/moneyflow/types";
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

    const denied = await denyUnlessFeature(user.id, "moneyflow");
    if (denied) return denied;

    const body = await req.json();
    const parsed = MoneyflowRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const result = await processMoneyflow(parsed.data);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    logError("MoneyflowAPI", err);
    return NextResponse.json(
      { error: "Failed to run MoneyFlow tool" },
      { status: 500 }
    );
  }
}
