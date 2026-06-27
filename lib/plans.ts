export type PlanType = "free" | "starter" | "pro" | "elite" | "creator_pro" | "ultimate";

export interface PlanConfig {
  name: string;
  price: number;
  color: string;
  limits: {
    ideas_per_day: number;      // -1 = unlimited
    titles_per_day: number;
    thumbnails_per_day: number;
    keywords_per_day: number;
    competitors_total: number;
  };
  features: string[];
}

export const PLANS: Record<PlanType, PlanConfig> = {
  free: {
    name: "Free",
    price: 0,
    color: "bg-gray-100 text-gray-600",
    limits: {
      ideas_per_day: 5,
      titles_per_day: 5,
      thumbnails_per_day: 2,
      keywords_per_day: 5,
      competitors_total: 1,
    },
    features: ["channel_audit", "ideas", "titles", "keywords"],
  },
  starter: {
    name: "Starter",
    price: 499,
    color: "bg-blue-100 text-blue-700",
    limits: {
      ideas_per_day: 50,
      titles_per_day: 30,
      thumbnails_per_day: 10,
      keywords_per_day: 30,
      competitors_total: 5,
    },
    features: ["channel_audit", "ideas", "titles", "thumbnails", "keywords", "competitors"],
  },
  pro: {
    name: "Pro",
    price: 1499,
    color: "bg-purple-100 text-purple-700",
    limits: {
      ideas_per_day: -1,
      titles_per_day: -1,
      thumbnails_per_day: -1,
      keywords_per_day: -1,
      competitors_total: 20,
    },
    features: ["channel_audit", "ideas", "titles", "thumbnails", "keywords", "competitors", "retention"],
  },
  elite: {
    name: "Elite",
    price: 3999,
    color: "bg-orange-100 text-orange-700",
    limits: {
      ideas_per_day: -1,
      titles_per_day: -1,
      thumbnails_per_day: -1,
      keywords_per_day: -1,
      competitors_total: -1,
    },
    features: ["all"],
  },
  creator_pro: {
    name: "Creator Pro+",
    price: 9999,
    color: "bg-pink-100 text-pink-700",
    limits: {
      ideas_per_day: -1,
      titles_per_day: -1,
      thumbnails_per_day: -1,
      keywords_per_day: -1,
      competitors_total: -1,
    },
    features: ["all"],
  },
  ultimate: {
    name: "Ultimate",
    price: 19999,
    color: "bg-gradient-to-r from-purple-600 to-blue-600 text-white",
    limits: {
      ideas_per_day: -1,
      titles_per_day: -1,
      thumbnails_per_day: -1,
      keywords_per_day: -1,
      competitors_total: -1,
    },
    features: ["all"],
  },
};

export type FeatureKey = "ideas_per_day" | "titles_per_day" | "thumbnails_per_day" | "keywords_per_day" | "competitors_total";

export const UPGRADE_MESSAGES: Record<FeatureKey, string> = {
  ideas_per_day: "Daily idea limit reached. Upgrade to Starter for 50 ideas/day →",
  titles_per_day: "Daily title limit reached. Upgrade to Starter for unlimited titles →",
  thumbnails_per_day: "Thumbnail analysis limit reached. Upgrade to Pro to unlock full Thumbnail AI →",
  keywords_per_day: "Keyword research limit reached. Upgrade to Starter for unlimited research →",
  competitors_total: "Competitor limit reached. Upgrade to Pro to track up to 20 channels →",
};

export const FEATURE_UPGRADE_HOOK: Record<string, string> = {
  ideas: "Aapke ideas ready hain! Lekin CTR abhi bhi low ho sakta hai — Upgrade to Pro for Thumbnail AI Scanner.",
  titles: "Title optimize ho gaya! Ab competitor ka analysis karo — Upgrade to Pro for Competitor Radar.",
  keywords: "Keywords ready hain! Ab inhe powerful titles mein convert karo — Upgrade to Starter for AI Title Writer.",
  retention: "Retention analysis complete! Ab content calendar banao — Upgrade to Elite for Content Automation.",
};
