import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { FE_SEED_CREDITS, PLANS, type PlanType } from "@/lib/plans";
import { OTO_CATALOG, type OtoId } from "@/lib/features";

const VALID_OTO_IDS = new Set(OTO_CATALOG.map((o) => o.id));
const VALID_PLAN_TYPES = new Set(Object.keys(PLANS));

function normalizeUnlockedOtos(input: unknown): string[] | { error: string } {
  if (!Array.isArray(input)) {
    return { error: "unlocked_otos must be an array of OTO ids (e.g. [\"oto2\",\"oto5\"])" };
  }

  const cleaned: string[] = [];
  for (const item of input) {
    if (typeof item !== "string") {
      return { error: "unlocked_otos entries must be strings" };
    }
    const id = item.toLowerCase().trim() as OtoId;
    if (!VALID_OTO_IDS.has(id)) {
      return {
        error: `Invalid OTO id: ${item}. Valid: ${Array.from(VALID_OTO_IDS).join(", ")}`,
      };
    }
    if (!cleaned.includes(id)) cleaned.push(id);
  }
  // Stable order oto1..oto12
  cleaned.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  return cleaned;
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userIdToUpdate = params.id;
    if (!userIdToUpdate) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const body = await request.json();
    const { plan_type, is_banned, role, unlocked_otos } = body;

    const supabase = await createClient();

    const {
      data: { user: currentUser },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", currentUser.id)
      .single();
    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
    }

    const updates: Record<string, unknown> = {};

    if (plan_type !== undefined) {
      if (typeof plan_type !== "string" || !VALID_PLAN_TYPES.has(plan_type)) {
        return NextResponse.json(
          {
            error: `Invalid plan_type. Valid: ${Array.from(VALID_PLAN_TYPES).join(", ")}`,
          },
          { status: 400 }
        );
      }
      updates.plan_type = plan_type as PlanType;
    }

    if (is_banned !== undefined) {
      if (typeof is_banned !== "boolean") {
        return NextResponse.json(
          { error: "is_banned must be a boolean" },
          { status: 400 }
        );
      }
      updates.is_banned = is_banned;
    }

    if (role !== undefined) {
      if (role !== "user" && role !== "admin") {
        return NextResponse.json(
          { error: "role must be 'user' or 'admin'" },
          { status: 400 }
        );
      }
      updates.role = role;
    }

    if (unlocked_otos !== undefined) {
      const normalized = normalizeUnlockedOtos(unlocked_otos);
      if ("error" in normalized) {
        return NextResponse.json({ error: normalized.error }, { status: 400 });
      }
      updates.unlocked_otos = normalized;
    }

    // When granting FE: seed video_engine_credits to at least FE_SEED_CREDITS (100)
    if (updates.plan_type === "fe") {
      const { data: target } = await supabase
        .from("profiles")
        .select("video_engine_credits")
        .eq("id", userIdToUpdate)
        .single();

      const currentCredits =
        typeof target?.video_engine_credits === "number"
          ? target.video_engine_credits
          : 0;

      if (currentCredits < FE_SEED_CREDITS) {
        updates.video_engine_credits = FE_SEED_CREDITS;
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const { data: updatedProfile, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", userIdToUpdate)
      .select()
      .single();

    if (error) {
      // Helpful message if migration not applied yet
      if (
        error.message?.includes("unlocked_otos") ||
        error.code === "PGRST204" ||
        error.message?.toLowerCase().includes("column")
      ) {
        return NextResponse.json(
          {
            error:
              error.message +
              " — If this is about unlocked_otos, run supabase/migrations/20260713_unlocked_otos.sql first.",
          },
          { status: 500 }
        );
      }
      throw error;
    }

    return NextResponse.json({ user: updatedProfile });
  } catch (error: any) {
    console.error("Admin Users PATCH Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
