import { z } from "zod";

export const CompetitorRequestSchema = z.object({
  // Accept full URLs, @handles, or channel IDs — normalized server-side
  channelUrl: z.string().min(2, "Channel URL or @handle is required"),
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
