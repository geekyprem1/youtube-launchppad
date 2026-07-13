/**
 * A/B Test Simulator prompt — ViralPredict (OTO6)
 */

export function buildABTestPromptV1(input: {
  mode: "title" | "thumbnail";
  topic?: string;
  variantA: string;
  variantB: string;
}) {
  const kind = input.mode === "thumbnail" ? "thumbnail concept / description" : "YouTube title";
  const topicLine = input.topic?.trim()
    ? `Video topic / niche: "${input.topic.trim()}"`
    : "Video topic: (not specified — infer from the variants)";

  return `You are an elite YouTube A/B test analyst for CreatorOS ViralPredict.

Compare TWO ${kind} options and predict which will win on YouTube (CTR + click intent).

${topicLine}

Option A:
"""
${input.variantA.trim()}
"""

Option B:
"""
${input.variantB.trim()}
"""

Rules:
- Be decisive when one is clearly stronger; use "tie" only if scores are within ~3 points.
- Scores are 0–100 packaging/CTR potential (not view counts).
- estimated_ctr is a realistic string range like "4.2% - 5.8%".
- Do not invent competitor channel names or fake view numbers.
- Keep strengths/weaknesses to 2–3 short bullets each.
- recommendation = one clear next action for the creator.

Return ONLY valid JSON (no markdown) with this exact shape:
{
  "winner": "A" | "B" | "tie",
  "confidence": 0-100,
  "summary": "1-2 sentence overall verdict",
  "why_winner": ["reason 1", "reason 2", "reason 3"],
  "variant_a": {
    "label": "short name for A",
    "score": 0-100,
    "estimated_ctr": "X% - Y%",
    "strengths": ["...", "..."],
    "weaknesses": ["...", "..."]
  },
  "variant_b": {
    "label": "short name for B",
    "score": 0-100,
    "estimated_ctr": "X% - Y%",
    "strengths": ["...", "..."],
    "weaknesses": ["...", "..."]
  },
  "recommendation": "What to publish / how to improve the loser"
}`;
}
