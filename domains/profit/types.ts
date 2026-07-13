import { z } from "zod";

export const ProfitToolSchema = z.enum([
  "revenue_planner",
  "digital_product",
  "roi_tracker",
  "brand_deals",
]);

export type ProfitTool = z.infer<typeof ProfitToolSchema>;

const ChannelBase = {
  niche: z.string().min(1).max(120),
  subs: z.coerce.number().min(0).max(500_000_000).optional().default(0),
  monthly_views: z.coerce.number().min(0).optional().default(0),
  country: z.string().max(80).optional().default("United States"),
  monthly_adsense_usd: z.coerce.number().min(0).optional().default(0),
};

export const RevenuePlannerSchema = z.object({
  tool: z.literal("revenue_planner"),
  ...ChannelBase,
  hours_per_week: z.coerce.number().min(0).max(168).optional().default(10),
  target_monthly_usd: z.coerce.number().min(0).optional().default(1000),
  current_streams: z.string().max(400).optional().default(""),
});

export const DigitalProductSchema = z.object({
  tool: z.literal("digital_product"),
  ...ChannelBase,
  skills: z.string().max(400).optional().default(""),
  audience_pain: z.string().max(400).optional().default(""),
  price_preference: z
    .enum(["low", "mid", "premium", "unsure"])
    .optional()
    .default("mid"),
});

export const RoiTrackerSchema = z.object({
  tool: z.literal("roi_tracker"),
  ...ChannelBase,
  /** JSON-ish free text or simple lines: name, cost, revenue */
  investments: z.string().max(2000).optional().default(""),
  ad_spend_usd: z.coerce.number().min(0).optional().default(0),
  tools_cost_usd: z.coerce.number().min(0).optional().default(0),
  freelance_cost_usd: z.coerce.number().min(0).optional().default(0),
  other_revenue_usd: z.coerce.number().min(0).optional().default(0),
});

export const BrandDealsSchema = z.object({
  tool: z.literal("brand_deals"),
  ...ChannelBase,
  avg_views: z.coerce.number().min(0).optional().default(0),
  engagement_rate_pct: z.coerce.number().min(0).max(100).optional().default(0),
  past_deals: z.string().max(400).optional().default(""),
  brand_categories: z.string().max(300).optional().default(""),
});

export const ProfitRequestSchema = z.discriminatedUnion("tool", [
  RevenuePlannerSchema,
  DigitalProductSchema,
  RoiTrackerSchema,
  BrandDealsSchema,
]);

export type ProfitRequest = z.infer<typeof ProfitRequestSchema>;
