import { z } from "zod";

export const PredictionRequestSchema = z.object({
  topic: z.string().min(1),
  title: z.string().min(1),
});

export type PredictionRequest = z.infer<typeof PredictionRequestSchema>;

export const PredictionAnalysisSchema = z.object({
  confidence_reason: z.string(),
  strengths: z.array(z.string()),
  risks: z.array(z.string()),
  improvements: z.array(
    z.object({
      type: z.enum(["Title", "Hook", "Thumbnail", "Pacing"]),
      old: z.string().optional(),
      new: z.string(),
    })
  ),
});

export const PredictionResponseSchema = z.object({
  current_score: z.number(),
  optimized_score: z.number(),
  confidence: z.number(),
  estimated_ctr: z.string(),
  estimated_retention: z.string(),
  analysis: PredictionAnalysisSchema,
});

export type PredictionResponse = z.infer<typeof PredictionResponseSchema>;
