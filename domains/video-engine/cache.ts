import { createHash } from "crypto";
import { createClient } from "@/lib/supabase/server";

/**
 * Builds a deterministic cache key from step + arbitrary params.
 * All param keys are sorted so { a, b } and { b, a } produce the same key.
 */
export function buildCacheKey(step: string, params: Record<string, unknown>): string {
  const sorted = Object.keys(params).sort().reduce<Record<string, unknown>>((acc, k) => {
    acc[k] = params[k];
    return acc;
  }, {});
  const canonical = JSON.stringify({ step, ...sorted });
  return createHash("sha256").update(canonical).digest("hex");
}

/**
 * Attempts to read a cached payload from the DB.
 * Returns null on cache miss or expired entry.
 */
export async function readCache<T>(cacheKey: string): Promise<T | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("video_engine_cache")
      .select("payload, expires_at")
      .eq("cache_key", cacheKey)
      .single();

    if (error || !data) return null;

    // Check expiry client-side as a safety net
    if (new Date(data.expires_at) < new Date()) return null;

    // Increment hit count (fire-and-forget)
    supabase
      .from("video_engine_cache")
      .update({ hit_count: supabase.rpc("increment", { x: 1 }) })
      .eq("cache_key", cacheKey)
      .then(() => {});

    return data.payload as T;
  } catch {
    return null;
  }
}

/**
 * Writes a payload to the cache using the service_role client.
 * Silently fails to never block the main response.
 */
export async function writeCache(
  cacheKey: string,
  step: string,
  payload: unknown
): Promise<void> {
  try {
    const supabase = await createClient();
    await supabase.from("video_engine_cache").upsert({
      cache_key: cacheKey,
      step,
      payload,
      hit_count: 1,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    }, { onConflict: "cache_key" });
  } catch {
    // Silent — cache writes are best-effort
  }
}
