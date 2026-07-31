/**
 * Universal credit system.
 *
 * - `video_engine_credits` (profiles) = universal text/image/voice credit pool.
 * - `ai_video_credits` (profiles)     = separate AI video (p-video) clip allotment. Never unlimited.
 *
 * 1 credit = $0.01 AI-cost budget. See CREDIT-SYSTEM-IMPLEMENTATION.md.
 */

import { createClient } from "@/lib/supabase/server";
import { ALL_ACCESS_PLANS } from "@/lib/features";
import { PLANS, type PlanType } from "@/lib/plans";

// ── Per-action credit cost (text/image/voice pool) ───────────────────
export const CREDIT_COST = {
  text: 1, // 1 text generation (title/idea/hook/desc/etc.)
  thumbnail: 2, // 1 thumbnail image (Z-Image + Gemini prompt)
  clickbait: 3, // 1 clickbait request (2 A/B variants)
  voicePer1000Chars: 1, // per 1,000 characters
  aiVideoClip: 1, // 1 AI video clip = 1 unit of the ai_video_credits pool
} as const;

/** Voice cost helper: ceil(chars / 1000), min 1. */
export function voiceCost(charCount: number): number {
  return Math.max(1, Math.ceil(charCount / 1000));
}

// ── Per-OTO grants (added on unlock) ─────────────────────────────────
export const OTO_CREDIT_GRANTS: Record<string, { credits: number; aiVideo: number }> = {
  fe: { credits: 60, aiVideo: 0 },
  oto1: { credits: 450, aiVideo: 0 },
  oto2: { credits: 300, aiVideo: 0 },
  oto3: { credits: 250, aiVideo: 0 },
  oto4: { credits: 200, aiVideo: 0 },
  oto5: { credits: 300, aiVideo: 0 },
  oto6: { credits: 220, aiVideo: 0 },
  oto7: { credits: 180, aiVideo: 0 },
  oto8: { credits: 220, aiVideo: 0 },
  oto9: { credits: 500, aiVideo: 40 },
  oto10: { credits: 250, aiVideo: 0 },
  oto11: { credits: 350, aiVideo: 0 },
  oto12: { credits: 1200, aiVideo: 80 },
};

// ── Text/image/voice credit pool ─────────────────────────────────────

export type CreditState = {
  credits: number | null; // null = column missing → treat as allow (no enforcement)
  unlimited: boolean;
  aiVideoCredits: number;
};

export async function getCreditState(userId: string): Promise<CreditState> {
  const supabase = await createClient();

  let data: {
    video_engine_credits?: number | null;
    ai_video_credits?: number | null;
    plan_type?: string | null;
    unlocked_otos?: string[] | null;
  } | null = null;

  const full = await supabase
    .from("profiles")
    .select("video_engine_credits, ai_video_credits, plan_type, unlocked_otos")
    .eq("id", userId)
    .single();

  if (full.error) {
    // Fallback if ai_video_credits / unlocked_otos not migrated yet
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
  const plan = rawPlan in PLANS ? rawPlan : "free";
  const credits =
    typeof data?.video_engine_credits === "number"
      ? data.video_engine_credits
      : null;
  const aiVideoCredits =
    typeof data?.ai_video_credits === "number" ? data.ai_video_credits : 0;

  // Only legacy internal high-tier plans are truly unlimited. All OTOs (incl. Infinity)
  // use lifetime credit pools so every cost is capped. AI video is NEVER unlimited.
  const unlimited =
    (ALL_ACCESS_PLANS as readonly string[]).includes(plan) || plan === "pro";

  return { credits, unlimited, aiVideoCredits };
}

/** Returns { ok:true } or a blocked response body. */
export function creditGate(
  state: Pick<CreditState, "credits" | "unlimited">,
  need: number
): { ok: true } | { ok: false; error: string; status: number } {
  if (state.unlimited) return { ok: true };
  if (typeof state.credits !== "number") return { ok: true }; // column missing → don't block
  if (state.credits < need) {
    return {
      ok: false,
      status: 402,
      error: `Insufficient credits (need ${need}, have ${state.credits}). Buy a top-up to continue.`,
    };
  }
  return { ok: true };
}

export async function spendCredits(
  userId: string,
  amount: number,
  state: Pick<CreditState, "credits" | "unlimited">
): Promise<void> {
  if (state.unlimited) return;
  if (typeof state.credits !== "number") return;
  const supabase = await createClient();
  await supabase
    .from("profiles")
    .update({ video_engine_credits: Math.max(0, state.credits - amount) })
    .eq("id", userId);
}

// ── AI video clip pool (hard cap, never unlimited) ───────────────────

export function aiVideoGate(
  aiVideoCredits: number,
  need = 1
): { ok: true } | { ok: false; error: string; status: number } {
  if (aiVideoCredits < need) {
    return {
      ok: false,
      status: 402,
      error: `No AI video clips left (need ${need}, have ${aiVideoCredits}). Buy a top-up to generate more.`,
    };
  }
  return { ok: true };
}

export async function spendAiVideoClips(
  userId: string,
  amount: number,
  current: number
): Promise<void> {
  const supabase = await createClient();
  await supabase
    .from("profiles")
    .update({ ai_video_credits: Math.max(0, current - amount) })
    .eq("id", userId);
}
