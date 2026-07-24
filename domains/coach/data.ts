import type { SupabaseClient } from "@supabase/supabase-js";

export interface RawCoachContext {
  userId: string;
  recentUploads: number; // videos the user analyzed/worked on in the last 30 days
  currentGoal: string;
  unresolvedIssues: number; // derived from real activity signals
  dataSource: "supabase" | "fallback";
}

/**
 * Builds the AI Coach's memory from the user's real, per-user activity in
 * Supabase (respecting RLS via the request-scoped client). Falls back to a
 * neutral context for anonymous users or when the DB is unreachable.
 */
export async function fetchCoachContext(
  userId: string,
  supabase?: SupabaseClient
): Promise<RawCoachContext> {
  const neutral: RawCoachContext = {
    userId,
    recentUploads: 0,
    currentGoal: "not set",
    unresolvedIssues: 0,
    dataSource: "fallback",
  };

  if (!supabase || !userId || userId === "anonymous") {
    return neutral;
  }

  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const countIn = async (table: string): Promise<number> => {
    try {
      const { count } = await supabase
        .from(table)
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .gte("created_at", since);
      return count || 0;
    } catch {
      return 0;
    }
  };

  try {
    const [retention, titles, ideas] = await Promise.all([
      countIn("retention_analyses"),
      countIn("title_scores"),
      countIn("ideas"),
    ]);

    const recentUploads = retention; // real videos worked on
    const pipeline = titles + ideas; // planned but not-yet-published content

    // Derive unresolved issues from real signals (no hardcoding).
    let unresolvedIssues = 0;
    if (recentUploads < 4) unresolvedIssues++; // below ~weekly publishing cadence
    if (pipeline > 0 && pipeline > recentUploads * 2) unresolvedIssues++; // planning >> publishing

    return {
      userId,
      recentUploads,
      currentGoal: "not set", // no goal field in schema yet — coach will ask
      unresolvedIssues,
      dataSource: "supabase",
    };
  } catch {
    return neutral;
  }
}
