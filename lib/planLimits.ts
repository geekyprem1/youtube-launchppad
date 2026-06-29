import { createClient } from "@/lib/supabase/server";
import { PLANS, type PlanType, type FeatureKey } from "@/lib/plans";

export async function getUserPlan(userId: string): Promise<PlanType> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("plan_type")
    .eq("id", userId)
    .single();
  return (data?.plan_type as PlanType) || "free";
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
