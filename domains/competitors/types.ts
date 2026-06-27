import { z } from "zod";

export const CompetitorRequestSchema = z.object({
  channelUrl: z.string().url("Must be a valid YouTube URL"),
});

export type CompetitorRequest = z.infer<typeof CompetitorRequestSchema>;

export const CompetitorAnalysisSchema = z.object({
  threat_reason: z.string(),
  opportunity_gaps: z.array(
    z.object({
      gap_type: z.string(),
      description: z.string(),
      action: z.string(),
    })
  ),
});

export const CompetitorResponseSchema = z.object({
  channel_name: z.string(),
  threat_level: z.string(),
  recent_viral: z.object({
    title: z.string(),
    views: z.string(),
    ctr: z.string(),
    upload_time: z.string(),
  }),
  analysis: CompetitorAnalysisSchema,
});

export type CompetitorResponse = z.infer<typeof CompetitorResponseSchema>;
