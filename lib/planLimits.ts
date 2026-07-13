import { createClient } from "@/lib/supabase/server";
import { PLANS, type PlanType, type FeatureKey } from "@/lib/plans";
import {
  canAccess,
  type AccessFeatureKey,
} from "@/lib/features";

export async function getUserPlan(userId: string): Promise<PlanType> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("plan_type")
    .eq("id", userId)
    .single();
  const plan = (data?.plan_type as PlanType) || "free";
  // Unknown / mistyped plan keys fall back to free so PLANS[plan] never crashes
  return plan in PLANS ? plan : "free";
}

export interface UserAccessProfile {
  plan: PlanType;
  unlockedOtos: string[];
  role: string;
  isAdmin: boolean;
}

/** Load plan + OTO unlocks + role for access checks */
export async function getUserAccessProfile(
  userId: string
): Promise<UserAccessProfile> {
  const supabase = await createClient();

  // Prefer full select; fall back if unlocked_otos column not migrated yet
  let data: {
    plan_type?: string | null;
    unlocked_otos?: string[] | null;
    role?: string | null;
  } | null = null;

  const full = await supabase
    .from("profiles")
    .select("plan_type, unlocked_otos, role")
    .eq("id", userId)
    .single();

  if (full.error) {
    const partial = await supabase
      .from("profiles")
      .select("plan_type, role")
      .eq("id", userId)
      .single();
    data = partial.data;
  } else {
    data = full.data;
  }

  const rawPlan = (data?.plan_type as PlanType) || "free";
  const plan = rawPlan in PLANS ? rawPlan : "free";
  const unlockedOtos = Array.isArray(data?.unlocked_otos)
    ? (data.unlocked_otos as string[])
    : [];
  const role = data?.role || "user";
  const isAdmin = role === "admin";

  return { plan, unlockedOtos, role, isAdmin };
}

/**
 * Server-side feature gate helper (Phase E will return 403 from APIs).
 * Safe if unlocked_otos column is missing until migration runs (treats as []).
 */
export async function userCanAccessFeature(
  userId: string,
  featureKey: AccessFeatureKey | string
): Promise<boolean> {
  const profile = await getUserAccessProfile(userId);
  return canAccess(profile.plan, profile.unlockedOtos, featureKey, {
    isAdmin: profile.isAdmin,
  });
}

export async function checkLimit(
  userId: string,
  feature: FeatureKey
): Promise<{ allowed: boolean; used: number; limit: number; plan: PlanType }> {
  const supabase = await createClient();
  const plan = await getUserPlan(userId);
  const limit = PLANS[plan].limits[feature];

  if (limit === -1) return { allowed: true, used: 0, limit: -1, plan };

  if (feature === "competitors_total") {
    const { count } = await supabase
      .from("competitors")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);
    const used = count ?? 0;
    return { allowed: used < limit, used, limit, plan };
  }

  const today = new Date().toISOString().split("T")[0];
  const { data } = await supabase
    .from("usage_logs")
    .select("count")
    .eq("user_id", userId)
    .eq("feature", feature)
    .eq("date", today)
    .single();

  const used = data?.count ?? 0;
  return { allowed: used < limit, used, limit, plan };
}

export async function incrementUsage(userId: string, feature: FeatureKey) {
  const supabase = await createClient();
  const { error } = await supabase.rpc('increment_daily_usage', {
    p_user_id: userId,
    p_feature: feature
  });

  if (error) {
    console.error("Failed to increment usage atomically:", error);
    throw error;
  }
}
