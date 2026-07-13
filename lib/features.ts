/**
 * CreatorOS / YT Launchpad — feature registry + OTO catalog + access checks.
 * Source: FE-OTO-ACCESS-PLAN.md
 *
 * Access is plan + unlocked_otos (admin manual). No payment webhooks.
 */

import type { PlanType } from "@/lib/plans";
import { PLANS } from "@/lib/plans";

// ── Feature keys (modules) ───────────────────────────────────────────

export const FEATURE_KEYS = [
  "video_engine",
  "video_engine_history",
  "thumbnail_basic",
  "thumbnail_history",
  "video_kit",
  "channel_engine",
  "ideas",
  "competitors",
  "keywords",
  "voice_studio",
  "toolkit",
  "clickbait",
  "video_creation_pro",
  "predictor",
  "optimize",
  "retention",
  "moneyflow",
  "profit",
] as const;

export type AccessFeatureKey = (typeof FEATURE_KEYS)[number];

/** Features included with FE ($17) base plan */
export const FE_FEATURES: readonly AccessFeatureKey[] = [
  "video_engine",
  "video_engine_history",
  "thumbnail_basic",
  "thumbnail_history",
] as const;

/** Plans that grant every module (legacy high tiers + infinity) */
export const ALL_ACCESS_PLANS: readonly PlanType[] = [
  "elite",
  "creator_pro",
  "ultimate",
] as const;

export const INFINITY_OTO_ID = "oto12";

// ── Route → feature mapping ──────────────────────────────────────────

export const FEATURE_ROUTES: Record<AccessFeatureKey, string[]> = {
  video_engine: ["/video-engine"],
  video_engine_history: ["/video-engine/history"],
  thumbnail_basic: ["/thumbnail-engine"],
  thumbnail_history: ["/thumbnail-engine/history"],
  video_kit: ["/video-engine/kit"],
  channel_engine: ["/dashboard"],
  ideas: ["/ideas"],
  competitors: ["/competitors"],
  keywords: ["/keywords"],
  voice_studio: ["/voice-studio"],
  toolkit: ["/toolkit"],
  clickbait: ["/clickbait-thumbnail"],
  video_creation_pro: ["/video-creation-pro"],
  predictor: ["/predictor"],
  optimize: ["/optimize"],
  retention: ["/retention"],
  moneyflow: [], // future
  profit: [], // future
};

// ── OTO catalog ──────────────────────────────────────────────────────

export type OtoId =
  | "oto1"
  | "oto2"
  | "oto3"
  | "oto4"
  | "oto5"
  | "oto6"
  | "oto7"
  | "oto8"
  | "oto9"
  | "oto10"
  | "oto11"
  | "oto12";

export interface OtoProduct {
  id: OtoId;
  name: string;
  price: number; // USD
  description: string;
  /** Feature keys unlocked by this OTO */
  unlocks: AccessFeatureKey[] | "all";
  /** Env var name for LaunchPadJV URL */
  envKey: string;
}

export const OTO_CATALOG: readonly OtoProduct[] = [
  {
    id: "oto1",
    name: "VideoForge PRO",
    price: 47,
    description: "Full Video Engine kit (11-step) and advanced VE tools",
    unlocks: ["video_kit"],
    envKey: "NEXT_PUBLIC_OTO1_URL",
  },
  {
    id: "oto2",
    name: "VoiceStudio AI",
    price: 59,
    description: "AI voiceovers and Voice Studio access",
    unlocks: ["voice_studio"],
    envKey: "NEXT_PUBLIC_OTO2_URL",
  },
  {
    id: "oto3",
    name: "ClickBoost",
    price: 39,
    description: "Clickbait Thumbnail Maker and thumbnail extras",
    unlocks: ["clickbait"],
    envKey: "NEXT_PUBLIC_OTO3_URL",
  },
  {
    id: "oto4",
    name: "RankPilot",
    price: 27,
    description: "Title & thumbnail optimize tools",
    unlocks: ["optimize"],
    envKey: "NEXT_PUBLIC_OTO4_URL",
  },
  {
    id: "oto5",
    name: "GrowthRadar",
    price: 49,
    description: "Channel Engine, ideas, competitors, keywords",
    unlocks: ["channel_engine", "ideas", "competitors", "keywords"],
    envKey: "NEXT_PUBLIC_OTO5_URL",
  },
  {
    id: "oto6",
    name: "ViralPredict",
    price: 37,
    description: "Success Predictor",
    unlocks: ["predictor"],
    envKey: "NEXT_PUBLIC_OTO6_URL",
  },
  {
    id: "oto7",
    name: "WatchTime MAX",
    price: 29,
    description: "Retention Analyzer",
    unlocks: ["retention"],
    envKey: "NEXT_PUBLIC_OTO7_URL",
  },
  {
    id: "oto8",
    name: "Creator Toolkit X",
    price: 39,
    description: "Toolkit Engine",
    unlocks: ["toolkit"],
    envKey: "NEXT_PUBLIC_OTO8_URL",
  },
  {
    id: "oto9",
    name: "Faceless Empire",
    price: 79,
    description: "Video Creation Pro + faceless production bundle",
    unlocks: ["video_creation_pro", "voice_studio", "clickbait", "video_kit"],
    envKey: "NEXT_PUBLIC_OTO9_URL",
  },
  {
    id: "oto10",
    name: "MoneyFlow",
    price: 49,
    description: "MoneyFlow hub (coming soon)",
    unlocks: ["moneyflow"],
    envKey: "NEXT_PUBLIC_OTO10_URL",
  },
  {
    id: "oto11",
    name: "Profit Accelerator",
    price: 69,
    description: "Profit tools (coming soon)",
    unlocks: ["profit"],
    envKey: "NEXT_PUBLIC_OTO11_URL",
  },
  {
    id: "oto12",
    name: "Infinity",
    price: 169,
    description: "All features unlocked",
    unlocks: "all",
    envKey: "NEXT_PUBLIC_OTO12_URL",
  },
] as const;

export const OTO_BY_ID: Record<OtoId, OtoProduct> = OTO_CATALOG.reduce(
  (acc, oto) => {
    acc[oto.id] = oto;
    return acc;
  },
  {} as Record<OtoId, OtoProduct>
);

// ── Feature metadata (labels for UI) ─────────────────────────────────

export const FEATURE_LABELS: Record<AccessFeatureKey, string> = {
  video_engine: "Video Engine",
  video_engine_history: "Video Engine History",
  thumbnail_basic: "Basic Thumbnail Engine",
  thumbnail_history: "Thumbnail History",
  video_kit: "Video Kit (Full)",
  channel_engine: "Channel Engine",
  ideas: "Recommendation Engine",
  competitors: "Competitor Intel",
  keywords: "Keyword Research",
  voice_studio: "Voice Studio",
  toolkit: "Toolkit Engine",
  clickbait: "Clickbait Thumbnail",
  video_creation_pro: "Video Creation Pro",
  predictor: "Success Predictor",
  optimize: "Title & Thumbnail Optimize",
  retention: "Retention Analyzer",
  moneyflow: "MoneyFlow",
  profit: "Profit Accelerator",
};

// ── Helpers ──────────────────────────────────────────────────────────

/** Map legacy PLANS.features strings → AccessFeatureKey where possible */
const LEGACY_FEATURE_MAP: Record<string, AccessFeatureKey[]> = {
  channel_audit: ["channel_engine"],
  ideas: ["ideas"],
  titles: ["optimize"],
  thumbnails: ["thumbnail_basic", "thumbnail_history"],
  keywords: ["keywords"],
  competitors: ["competitors"],
  retention: ["retention"],
  video_engine: ["video_engine", "video_engine_history"],
  thumbnail_basic: ["thumbnail_basic", "thumbnail_history"],
};

function featuresUnlockedByOtos(
  unlockedOtos: string[] | null | undefined
): Set<AccessFeatureKey> | "all" {
  const set = new Set<AccessFeatureKey>();
  if (!unlockedOtos?.length) return set;

  for (const raw of unlockedOtos) {
    const id = raw.toLowerCase().trim() as OtoId;
    if (id === INFINITY_OTO_ID) return "all";
    const product = OTO_BY_ID[id];
    if (!product) continue;
    if (product.unlocks === "all") return "all";
    for (const key of product.unlocks) set.add(key);
  }
  return set;
}

function featuresFromLegacyPlan(plan: PlanType): Set<AccessFeatureKey> | "all" {
  const config = PLANS[plan];
  if (!config) return new Set();
  if (config.features.includes("all")) return "all";

  const set = new Set<AccessFeatureKey>();
  for (const f of config.features) {
    if (f === "all") return "all";
    const mapped = LEGACY_FEATURE_MAP[f];
    if (mapped) mapped.forEach((k) => set.add(k));
    // Direct match if plan already stores AccessFeatureKey strings (e.g. fe)
    if ((FEATURE_KEYS as readonly string[]).includes(f)) {
      set.add(f as AccessFeatureKey);
    }
  }
  return set;
}

export interface CanAccessOptions {
  /** When true, bypass all locks */
  isAdmin?: boolean;
}

/**
 * Core access check used by Sidebar, upgrade page, and API gates.
 *
 * @example
 * canAccess('fe', [], 'video_engine') // true
 * canAccess('fe', [], 'voice_studio') // false
 * canAccess('fe', ['oto2'], 'voice_studio') // true
 * canAccess('free', [], 'video_engine') // false
 * canAccess('fe', ['oto12'], 'predictor') // true
 */
export function canAccess(
  plan: PlanType | string | null | undefined,
  unlockedOtos: string[] | null | undefined,
  featureKey: AccessFeatureKey | string,
  options?: CanAccessOptions
): boolean {
  if (options?.isAdmin) return true;

  const key = featureKey as AccessFeatureKey;
  if (!(FEATURE_KEYS as readonly string[]).includes(key)) return false;

  const planType = (plan || "free") as PlanType;

  // Infinity OTO or all-access plan tiers
  if ((ALL_ACCESS_PLANS as readonly string[]).includes(planType)) return true;
  if (PLANS[planType]?.features?.includes("all")) return true;

  const fromOtos = featuresUnlockedByOtos(unlockedOtos);
  if (fromOtos === "all") return true;
  if (fromOtos.has(key)) return true;

  // FE base: only FE_FEATURES
  if (planType === "fe") {
    return (FE_FEATURES as readonly string[]).includes(key);
  }

  // free: nothing unless OTO already granted above
  if (planType === "free") {
    return false;
  }

  // Legacy starter/pro etc.
  const fromPlan = featuresFromLegacyPlan(planType);
  if (fromPlan === "all") return true;
  return fromPlan.has(key);
}

/** Which OTO(s) unlock a feature (for upgrade CTAs) */
export function getOtosForFeature(featureKey: AccessFeatureKey): OtoProduct[] {
  return OTO_CATALOG.filter((oto) => {
    if (oto.unlocks === "all") return true;
    return oto.unlocks.includes(featureKey);
  });
}

/** Whether user already owns an OTO id */
export function ownsOto(
  unlockedOtos: string[] | null | undefined,
  otoId: OtoId | string
): boolean {
  if (!unlockedOtos?.length) return false;
  const id = otoId.toLowerCase();
  if (unlockedOtos.some((o) => o.toLowerCase() === INFINITY_OTO_ID)) return true;
  return unlockedOtos.some((o) => o.toLowerCase() === id);
}

/** Resolve feature key from a dashboard pathname (best-effort) */
export function featureKeyFromPath(pathname: string): AccessFeatureKey | null {
  const path = pathname.replace(/\/$/, "") || "/";

  // More specific paths first
  const ordered: AccessFeatureKey[] = [
    "video_engine_history",
    "thumbnail_history",
    "video_kit",
    "video_engine",
    "thumbnail_basic",
    "channel_engine",
    "ideas",
    "competitors",
    "keywords",
    "voice_studio",
    "toolkit",
    "clickbait",
    "video_creation_pro",
    "predictor",
    "optimize",
    "retention",
  ];

  for (const key of ordered) {
    const routes = FEATURE_ROUTES[key];
    for (const route of routes) {
      if (path === route || path.startsWith(route + "/")) {
        // /video-engine/kit is kit, not core video_engine
        if (key === "video_engine" && path.startsWith("/video-engine/kit")) {
          continue;
        }
        if (
          key === "video_engine" &&
          path.startsWith("/video-engine/history")
        ) {
          continue;
        }
        if (
          key === "thumbnail_basic" &&
          path.startsWith("/thumbnail-engine/history")
        ) {
          continue;
        }
        return key;
      }
    }
  }
  return null;
}
