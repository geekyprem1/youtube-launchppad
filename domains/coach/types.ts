import { z } from "zod";

export const CoachMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
});

export type CoachMessage = z.infer<typeof CoachMessageSchema>;

export const CoachRequestSchema = z.object({
  messages: z.array(CoachMessageSchema),
});

export type CoachRequest = z.infer<typeof CoachRequestSchema>;

export const CoachAnalysisSchema = z.object({
  reply: z.string(),
  suggested_actions: z.array(
    z.object({
      label: z.string(),
      action: z.string(),
    })
  ).optional(),
});

export const CoachResponseSchema = z.object({
  context_score: z.number(), // Replaces generic metric
  analysis: CoachAnalysisSchema,
});

export type CoachResponse = z.infer<typeof CoachResponseSchema>;
