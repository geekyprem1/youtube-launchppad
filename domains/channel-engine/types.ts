import { z } from "zod";

export const ChannelScorecardSchema = z.object({
  score: z.number().min(0).max(100),
  label: z.string(),
  reason: z.string(),
});

export const ChannelOverviewSchema = z.object({
  channel_name: z.string(),
  niche: z.string(),
  primary_content_type: z.string(),
  upload_frequency: z.string(),
  estimated_target_audience: z.string(),
  growth_stage: z.string(),
});

export const ChannelFindingsSchema = z.object({
  what_is_working: z.array(z.string()),
  growth_blockers: z.array(z.string()),
  critical_mistakes: z.array(z.string()),
  missed_opportunities: z.array(z.string()),
});

export const ActionItemSchema = z.object({
  title: z.string(),
  description: z.string(),
  impact: z.enum(["High", "Medium", "Low"]),
});

export const ChannelStrategySchema = z.object({
  action_plan: z.array(ActionItemSchema),
  quick_wins: z.array(z.string()),
  long_term: z.object({
    days_30: z.array(z.string()),
    days_90: z.array(z.string()),
    months_6: z.array(z.string()),
  }),
});

export const ChannelReportSchema = z.object({
  overall_score: z.number().min(0).max(100),
  analysis_type: z.enum(["real", "ai_smart"]),
  overview: ChannelOverviewSchema,
  scorecards: z.object({
    branding: ChannelScorecardSchema,
    channel_seo: ChannelScorecardSchema,
    thumbnail_quality: ChannelScorecardSchema,
    title_quality: ChannelScorecardSchema,
    hook_strength: ChannelScorecardSchema,
    description_optimization: ChannelScorecardSchema,
    keyword_usage: ChannelScorecardSchema,
    tags: ChannelScorecardSchema,
    playlists: ChannelScorecardSchema,
    upload_consistency: ChannelScorecardSchema,
    audience_targeting: ChannelScorecardSchema,
    video_structure: ChannelScorecardSchema,
    viewer_retention_potential: ChannelScorecardSchema,
    ctr_potential: ChannelScorecardSchema,
    engagement_optimization: ChannelScorecardSchema,
    monetization_readiness: ChannelScorecardSchema,
    viral_potential: ChannelScorecardSchema,
  }),
  findings: ChannelFindingsSchema,
  strategy: ChannelStrategySchema,
});

export type ChannelReport = z.infer<typeof ChannelReportSchema>;
