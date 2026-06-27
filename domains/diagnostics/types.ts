import { z } from "zod";

export const DiagnosticRequestSchema = z.object({
  channelUrl: z.string().url("Must be a valid YouTube URL"),
});

export type DiagnosticRequest = z.infer<typeof DiagnosticRequestSchema>;

export const AuditAnalysisSchema = z.object({
  priority_queue: z.array(
    z.object({
      issue: z.string(),
      why: z.string(),
      impact: z.enum(["Critical", "High", "Medium", "Low"]),
      time: z.string(),
      difficulty: z.enum(["Low", "Medium", "Hard"]),
      expected_improvement: z.string(),
      fix: z.string(),
    })
  ),
  upgrade_hook: z.string(),
});

export const DiagnosticResponseSchema = z.object({
  growth_score: z.number(),
  score_breakdown: z.array(
    z.object({
      label: z.string(),
      value: z.string(),
      color: z.string(),
    })
  ),
  analysis: AuditAnalysisSchema,
});

export type DiagnosticResponse = z.infer<typeof DiagnosticResponseSchema>;
