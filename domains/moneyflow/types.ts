import { z } from "zod";

export const MoneyflowToolSchema = z.enum([
  "roadmap",
  "rpm",
  "affiliate",
  "sponsorship",
  "adsense",
]);

export type MoneyflowTool = z.infer<typeof MoneyflowToolSchema>;

const ChannelContext = {
  niche: z.string().min(1).max(120),
  subs: z.coerce.number().min(0).max(500_000_000).optional().default(0),
  monthly_views: z.coerce.number().min(0).max(10_000_000_000).optional().default(0),
  country: z.string().max(80).optional().default("United States"),
  monetized: z.boolean().optional().default(false),
};

export const RoadmapRequestSchema = z.object({
  tool: z.literal("roadmap"),
  ...ChannelContext,
  goals: z.string().max(500).optional().default(""),
});

export const RpmRequestSchema = z.object({
  tool: z.literal("rpm"),
  ...ChannelContext,
  rpm_usd: z.coerce.number().min(0).max(100).optional(), // if known
  cpm_usd: z.coerce.number().min(0).max(100).optional(),
  watch_hours_month: z.coerce.number().min(0).optional().default(0),
});

export const AffiliateRequestSchema = z.object({
  tool: z.literal("affiliate"),
  ...ChannelContext,
  products_interest: z.string().max(300).optional().default(""),
});

export const SponsorshipRequestSchema = z.object({
  tool: z.literal("sponsorship"),
  ...ChannelContext,
  avg_views_per_video: z.coerce.number().min(0).optional().default(0),
  brand_fit: z.string().max(300).optional().default(""),
});

export const AdsenseRequestSchema = z.object({
  tool: z.literal("adsense"),
  ...ChannelContext,
  subs: z.coerce.number().min(0).optional().default(0),
  watch_hours_12m: z.coerce.number().min(0).optional().default(0),
  shorts_views_90d: z.coerce.number().min(0).optional().default(0),
  community_guidelines_ok: z.boolean().optional().default(true),
  original_content: z.boolean().optional().default(true),
  two_factor: z.boolean().optional().default(false),
  linked_adsense: z.boolean().optional().default(false),
  phone_verified: z.boolean().optional().default(false),
});

export const MoneyflowRequestSchema = z.discriminatedUnion("tool", [
  RoadmapRequestSchema,
  RpmRequestSchema,
  AffiliateRequestSchema,
  SponsorshipRequestSchema,
  AdsenseRequestSchema,
]);

export type MoneyflowRequest = z.infer<typeof MoneyflowRequestSchema>;
