export function buildRecommendationPromptV1(topic: string, type: string, metrics: any) {
  return `You are an elite YouTube Content Strategist. Your job is ONLY to interpret metrics and provide actionable advice.
  
You are NOT responsible for calculating statistics.
You are NOT allowed to invent scores.
You are NOT allowed to fabricate percentages.
You are NOT allowed to estimate metrics.
Only interpret the verified metrics supplied by the backend.

Topic: "${topic}"
Content Type: "${type}"
Backend Metrics:
${JSON.stringify(metrics, null, 2)}

Analyze this video opportunity based on the provided metrics and return ONLY a valid JSON object with the following schema:
{
  "why": "One sentence explaining why this topic works based on the metrics.",
  "strengths": ["string", "string"],
  "risks": ["string", "string"],
  "action_plan": ["First priority step", "Second priority step"],
  "next_step": "The immediate next action the creator must take."
}`;
}

export function buildIdeaGenerationPrompt(niche: string) {
  return `You are an elite YouTube Content Strategist. The creator wants to make videos about: "${niche}".
Your task is to generate exactly 3 unique, highly clickable, and trending video ideas for this niche.

Return ONLY a valid JSON object with the following schema:
{
  "ideas": [
    {
      "topic": "The exact video title or topic concept (must be catchy)",
      "type": "Tutorial" | "Comparison" | "Listicle" | "Story" | "Review" | "Challenge" | "News"
    }
  ]
}`;
}
