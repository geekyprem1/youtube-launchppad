import { z } from "zod";

export const ToolkitTitleSchema = z.object({
  text: z.string(),
  ctr_score: z.number().min(0).max(100),
  seo_score: z.number().min(0).max(100),
  viral_score: z.number().min(0).max(100),
  is_best: z.boolean(),
});

export const ToolkitHashtagsSchema = z.object({
  primary: z.array(z.string()),
  secondary: z.array(z.string()),
  trending: z.array(z.string()),
});

export const ToolkitKeywordsSchema = z.object({
  primary: z.array(z.string()),
  secondary: z.array(z.string()),
  long_tail: z.array(z.string()),
});

export const ToolkitResponseSchema = z.object({
  titles: z.array(ToolkitTitleSchema).length(5),
  description: z.string(),
  keywords: ToolkitKeywordsSchema,
  tags: z.array(z.string()),
  hashtags: ToolkitHashtagsSchema,
});

export type ToolkitTitle = z.infer<typeof ToolkitTitleSchema>;
export type ToolkitHashtags = z.infer<typeof ToolkitHashtagsSchema>;
export type ToolkitKeywords = z.infer<typeof ToolkitKeywordsSchema>;
export type ToolkitResponse = z.infer<typeof ToolkitResponseSchema>;
