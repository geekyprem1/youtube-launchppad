import { z } from "zod";

export const UploadChecklistRequestSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional().default(""),
  tags: z.string().max(2000).optional().default(""), // comma-separated
  category: z.string().max(80).optional().default(""),
  thumbnail_ready: z.boolean().optional().default(false),
  end_screen: z.boolean().optional().default(false),
  cards: z.boolean().optional().default(false),
  chapters: z.boolean().optional().default(false),
  playlist: z.boolean().optional().default(false),
  language: z.string().max(40).optional().default("English"),
  video_type: z.enum(["long", "short", "live"]).optional().default("long"),
});

export type UploadChecklistRequest = z.infer<typeof UploadChecklistRequestSchema>;

export type CheckStatus = "pass" | "warn" | "fail";

export interface ChecklistItem {
  id: string;
  category: "title" | "seo" | "ctr" | "packaging" | "publish";
  label: string;
  status: CheckStatus;
  score: number; // 0-100 contribution weight normalized later
  detail: string;
  fix?: string;
}

export const RankPilotAISchema = z.object({
  upload_ready_score: z.number().min(0).max(100),
  verdict: z.string(),
  priority_fixes: z.array(
    z.object({
      area: z.string(),
      issue: z.string(),
      fix: z.string(),
      impact: z.enum(["high", "medium", "low"]),
    })
  ),
  title_suggestions: z.array(z.string()).max(5),
  description_hooks: z.array(z.string()).max(3),
  tag_suggestions: z.array(z.string()).max(12),
  seo_summary: z.string(),
  ctr_summary: z.string(),
});

export type RankPilotAI = z.infer<typeof RankPilotAISchema>;
