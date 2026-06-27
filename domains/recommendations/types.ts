import { z } from "zod";

export const RecommendationRequestSchema = z.object({
  niche: z.string().min(1),
  channelId: z.string().optional(),
});

export type RecommendationRequest = z.infer<typeof RecommendationRequestSchema>;

export const RawIdeaSchema = z.object({
  topic: z.string(),
  type: z.enum(["Tutorial", "Comparison", "Listicle", "Story", "Review", "Challenge", "News"]),
});

export const IdeaAnalysisSchema = z.object({
  why: z.string(),
  strengths: z.array(z.string()),
  risks: z.array(z.string()),
  action_plan: z.array(z.string()),
  next_step: z.string(),
});

export const RecommendationResponseSchema = z.object({
  ideas: z.array(
    z.object({
      id: z.string(),
      topic: z.string(),
      type: z.string(),
      opportunity_score: z.number(),
      score_breakdown: z.array(
        z.object({
          label: z.string(),
          value: z.string(),
          color: z.string(),
        })
      ),
      roi: z.object({
        reach: z.string(),
        subs: z.string(),
        growth: z.string(),
        confidence: z.number(),
      }),
      analysis: IdeaAnalysisSchema,
    })
  )
});

export type RecommendationResponse = z.infer<typeof RecommendationResponseSchema>;
