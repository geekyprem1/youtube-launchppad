/**
 * Video Engine credit / cap rules.
 * OTO1 (VideoForge / video_kit) and high tiers skip daily credit burn.
 */

import { createClient } from "@/lib/supabase/server";
import { ALL_ACCESS_PLANS, ownsOto } from "@/lib/features";
import type { PlanType } from "@/lib/plans";
import { PLANS } from "@/lib/plans";

export type VideoEngineCreditState = {
  planType: PlanType;
  credits: number | null;
  /** true = do not check or decrement credits */
  unlimited: boolean;
  unlockedOtos: string[];
};

export async function getVideoEngineCreditState(
  userId: string
): Promise<VideoEngineCreditState> {
  const supabase = await createClient();

  let data: {
    video_engine_credits?: number | null;
    plan_type?: string | null;
    unlocked_otos?: string[] | null;
  } | null = null;

  const full = await supabase
    .from("profiles")
    .select("video_engine_credits, plan_type, unlocked_otos")
    .eq("id", userId)
    .single();

  if (full.error) {
    const partial = await supabase
      .from("profiles")
      .select("video_engine_credits, plan_type")
      .eq("id", userId)
      .single();
    data = partial.data;
  } else {
    data = full.data;
  }

  const rawPlan = (data?.plan_type as PlanType) || "free";
  const planType = rawPlan in PLANS ? rawPlan : "free";
  const unlockedOtos = Array.isArray(data?.unlocked_otos)
    ? (data!.unlocked_otos as string[])
    : [];
  const credits =
    typeof data?.video_engine_credits === "number"
      ? data.video_engine_credits
      : null;

  const unlimited =
    (ALL_ACCESS_PLANS as readonly string[]).includes(planType) ||
    planType === "pro" ||
    ownsOto(unlockedOtos, "oto1") ||
    ownsOto(unlockedOtos, "oto12") ||
    ownsOto(unlockedOtos, "oto9"); // Faceless bundle includes kit-class production

  return { planType, credits, unlimited, unlockedOtos };
}

export async function decrementVideoEngineCredits(
  userId: string,
  amount: number,
  state: VideoEngineCreditState
): Promise<void> {
  if (state.unlimited) return;
  if (typeof state.credits !== "number") return;

  const supabase = await createClient();
  await supabase
    .from("profiles")
    .update({ video_engine_credits: Math.max(0, state.credits - amount) })
    .eq("id", userId);
}

/** Throws nothing — returns error response body if blocked */
export function creditGate(
  state: VideoEngineCreditState,
  need: number
): { ok: true } | { ok: false; error: string; status: number } {
  if (state.unlimited) return { ok: true };
  if (typeof state.credits !== "number") return { ok: true }; // column missing
  if (state.credits < need) {
    return {
      ok: false,
      error: `Insufficient credits (need ${need}, have ${state.credits}). Upgrade VideoForge (OTO1) for unlimited gens, or ask admin to top up.`,
      status: 402,
    };
  }
  return { ok: true };
}
