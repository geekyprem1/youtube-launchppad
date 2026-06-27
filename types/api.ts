import { z } from "zod";

export const APIResponseSchema = z.object({
  version: z.object({
    scoring: z.string(),
    rules: z.string(),
    prompt: z.string().optional(),
  }),
  metrics: z.record(z.string(), z.any()),
  breakdown: z.record(z.string(), z.any()).optional(),
  analysis: z.object({
    summary: z.string().optional(),
    why: z.string().optional(),
    strengths: z.array(z.string()).optional(),
    weaknesses: z.array(z.string()).optional(),
    risks: z.array(z.string()).optional(),
  }).optional(),
  actions: z.array(
    z.object({
      priority: z.number(),
      task: z.string(),
      impact: z.string(),
    })
  ).optional(),
  ideas: z.array(z.any()).optional(), // Extended specifically for the recommendation domain
});

export type APIResponse = z.infer<typeof APIResponseSchema>;
