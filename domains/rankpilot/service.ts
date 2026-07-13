import { callAI } from "@/lib/openrouter";
import { safeJsonParse } from "@/lib/utils";
import { runUploadChecklist } from "./checklist";
import { buildRankPilotPrompt } from "./prompts";
import {
  RankPilotAISchema,
  type RankPilotAI,
  type UploadChecklistRequest,
} from "./types";

const FALLBACK_AI: RankPilotAI = {
  upload_ready_score: 50,
  verdict: "Checklist complete — review priority fixes before publishing.",
  priority_fixes: [
    {
      area: "SEO",
      issue: "AI suggestions unavailable",
      fix: "Re-run RankPilot or fix failed checklist items manually.",
      impact: "medium",
    },
  ],
  title_suggestions: [],
  description_hooks: [],
  tag_suggestions: [],
  seo_summary: "Focus on title keywords, description depth, and tags.",
  ctr_summary: "Pair a clear title hook with a high-contrast thumbnail.",
};

export async function processUploadChecklist(input: UploadChecklistRequest) {
  const checklist = runUploadChecklist(input);

  const prompt = buildRankPilotPrompt(input, checklist);
  let ai: RankPilotAI = FALLBACK_AI;

  try {
    const raw = await callAI([{ role: "user", content: prompt }], {
      json: true,
      temperature: 0.4,
      max_tokens: 1800,
    });
    const parsed = safeJsonParse(raw, null);
    const validated = RankPilotAISchema.safeParse(parsed);
    if (validated.success) {
      ai = validated.data;
    } else {
      ai = {
        ...FALLBACK_AI,
        upload_ready_score: checklist.overall_score,
      };
    }
  } catch {
    ai = {
      ...FALLBACK_AI,
      upload_ready_score: checklist.overall_score,
    };
  }

  // Blend rule score with AI score
  const blended = Math.round(
    checklist.overall_score * 0.55 + ai.upload_ready_score * 0.45
  );

  return {
    version: { rules: "rankpilot.checklist.v1", prompt: "rankpilot.v1" },
    metrics: {
      overall_score: blended,
      rule_score: checklist.overall_score,
      ai_score: ai.upload_ready_score,
      pass_count: checklist.pass_count,
      warn_count: checklist.warn_count,
      fail_count: checklist.fail_count,
    },
    checklist: checklist.items,
    ai,
  };
}
