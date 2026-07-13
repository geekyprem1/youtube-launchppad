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

// ── A/B Test Simulator (ViralPredict OTO6) ───────────────────────────

export const ABTestRequestSchema = z.object({
  mode: z.enum(["title", "thumbnail"]).default("title"),
  topic: z.string().max(200).optional().default(""),
  variant_a: z.string().min(1).max(500),
  variant_b: z.string().min(1).max(500),
});

export type ABTestRequest = z.infer<typeof ABTestRequestSchema>;

export const ABVariantScoreSchema = z.object({
  label: z.string(),
  score: z.number().min(0).max(100),
  estimated_ctr: z.string(),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
});

export const ABTestAnalysisSchema = z.object({
  winner: z.enum(["A", "B", "tie"]),
  confidence: z.number().min(0).max(100),
  summary: z.string(),
  why_winner: z.array(z.string()),
  variant_a: ABVariantScoreSchema,
  variant_b: ABVariantScoreSchema,
  recommendation: z.string(),
});

export type ABTestAnalysis = z.infer<typeof ABTestAnalysisSchema>;
