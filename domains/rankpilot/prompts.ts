import type { ChecklistItem, UploadChecklistRequest } from "./types";

export function buildRankPilotPrompt(
  input: UploadChecklistRequest,
  checklist: {
    items: ChecklistItem[];
    overall_score: number;
  }
) {
  const fails = checklist.items.filter((i) => i.status === "fail");
  const warns = checklist.items.filter((i) => i.status === "warn");

  return `You are CreatorOS RankPilot — a YouTube upload optimization coach.

Given the creator's draft upload package and our rule-based checklist scores, produce actionable SEO + CTR guidance.

Draft:
- Title: "${input.title}"
- Description: """${(input.description || "").slice(0, 1500)}"""
- Tags: ${(input.tags || "").slice(0, 400) || "(none)"}
- Category: ${input.category || "(none)"}
- Video type: ${input.video_type}
- Thumbnail ready: ${input.thumbnail_ready}
- End screen: ${input.end_screen}
- Cards: ${input.cards}
- Chapters: ${input.chapters}
- Playlist: ${input.playlist}

Rule-based overall_score: ${checklist.overall_score}/100
Failed checks: ${fails.map((f) => f.label).join("; ") || "none"}
Warnings: ${warns.map((w) => w.label).join("; ") || "none"}

Rules:
- Do NOT invent fake view counts or competitor names.
- upload_ready_score should be close to ${checklist.overall_score} (±12) unless you see a critical issue.
- priority_fixes: 3–5 items, highest impact first.
- title_suggestions: 3–5 improved titles (keep honest, searchable).
- tag_suggestions: 8–12 practical tags.
- description_hooks: 2–3 opening lines for the description.

Return ONLY valid JSON:
{
  "upload_ready_score": 0-100,
  "verdict": "one sentence",
  "priority_fixes": [
    { "area": "Title|SEO|CTR|Packaging|Publish", "issue": "...", "fix": "...", "impact": "high|medium|low" }
  ],
  "title_suggestions": ["...", "..."],
  "description_hooks": ["...", "..."],
  "tag_suggestions": ["...", "..."],
  "seo_summary": "2-3 sentences on SEO",
  "ctr_summary": "2-3 sentences on CTR packaging"
}`;
}
