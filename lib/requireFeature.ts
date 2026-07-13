/**
 * Server-side feature gates for API routes (FE-OTO-ACCESS-PLAN Phase E).
 * Returns a 403 NextResponse when the user cannot access the feature.
 */

import { NextResponse } from "next/server";
import {
  canAccess,
  FEATURE_LABELS,
  type AccessFeatureKey,
} from "@/lib/features";
import {
  getUserAccessProfile,
  userCanAccessFeature,
} from "@/lib/planLimits";

export type RequireFeatureResult =
  | { ok: true; profile: Awaited<ReturnType<typeof getUserAccessProfile>> }
  | { ok: false; response: NextResponse };

/**
 * Check access and return either ok + profile, or a ready-to-return 403.
 *
 * @example
 * const access = await requireFeature(user.id, "voice_studio");
 * if (!access.ok) return access.response;
 */
export async function requireFeature(
  userId: string,
  featureKey: AccessFeatureKey | string
): Promise<RequireFeatureResult> {
  const profile = await getUserAccessProfile(userId);
  const allowed = canAccess(profile.plan, profile.unlockedOtos, featureKey, {
    isAdmin: profile.isAdmin,
  });

  if (allowed) {
    return { ok: true, profile };
  }

  const key = featureKey as AccessFeatureKey;
  const label =
    (FEATURE_LABELS as Record<string, string>)[key] || String(featureKey);

  return {
    ok: false,
    response: NextResponse.json(
      {
        error: `${label} is locked on your plan. Upgrade to unlock.`,
        code: "FEATURE_LOCKED",
        feature: featureKey,
        upgrade_url: `/upgrade?feature=${encodeURIComponent(String(featureKey))}`,
      },
      { status: 403 }
    ),
  };
}

/**
 * Convenience: returns NextResponse to return immediately, or null if allowed.
 *
 * @example
 * const denied = await denyUnlessFeature(user.id, "toolkit");
 * if (denied) return denied;
 */
export async function denyUnlessFeature(
  userId: string,
  featureKey: AccessFeatureKey | string
): Promise<NextResponse | null> {
  const result = await requireFeature(userId, featureKey);
  return result.ok ? null : result.response;
}

/** Boolean-only check (no response body) */
export async function hasFeatureAccess(
  userId: string,
  featureKey: AccessFeatureKey | string
): Promise<boolean> {
  return userCanAccessFeature(userId, featureKey);
}
