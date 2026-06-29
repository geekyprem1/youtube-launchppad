import { buildSystemPrompt } from "@/lib/video-engine/prompt-context";
import { ContentContext } from "../types";

/**
 * Builds the topics discovery prompt.
 * Used when user provides a keyword or channel niche.
 */
export function buildTopicsPrompt(
  input: string,
  inputType: "keyword" | "channel"
): string {
  const context =
    inputType === "channel"
      ? `The user's YouTube channel niche/topic is: "${input}". Analyze what video topics would perform best for their existing audience.`
      : `The user wants to make videos about: "${input}".`;

  return `You are an elite YouTube Content Strategist with deep expertise in trend analysis and audience psychology.

${context}

Generate exactly 6 unique, highly clickable, and currently trending video ideas for this niche.

For each idea, assess its real potential based on:
- Current search demand and YouTube algorithm signals
- Competition level in this space
- Audience engagement potential
- Content differentiation opportunity

Return ONLY a valid JSON object with this exact schema:
{
  "topics": [
    {
      "topic": "The exact compelling video title or topic concept (must be specific, not generic)",
      "trend_score": "Low" | "Medium" | "High" | "Viral",
      "views_potential": "e.g. '50K–200K' or '1M+' — realistic estimate",
      "reason": "One powerful sentence explaining WHY this topic will perform well RIGHT NOW."
    }
  ]
}`;
}

/**
 * Builds the hooks generation prompt.
 * Receives full ContentContext so tone, video type, and audience shape the hooks.
 */
export function buildHooksPrompt(ctx: ContentContext): { system: string; user: string } {
  const systemPrompt = buildSystemPrompt(ctx);

  const userPrompt = `Generate exactly 5 unique, powerful hook lines for this YouTube video.

Topic: "${ctx.topic}"
Video Format: ${ctx.video_type}
Audience: ${ctx.audience_level} level, age group ${ctx.audience_age}
Tone: ${ctx.tone}

Create one hook for each of these types: Curiosity, Story, Shocking Fact, Question, FOMO.
Each hook must be adapted to the video format (e.g., Shorts hooks should be ultra-punchy and under 10 words).
Hooks must feel natural in the selected language and tone.

Return ONLY a valid JSON object with this exact schema:
{
  "hooks": [
    {
      "text": "The full hook line exactly as it would be spoken",
      "type": "Curiosity" | "Story" | "Shocking Fact" | "Question" | "FOMO",
      "confidence_score": 0-100
    }
  ]
}`;

  return { system: systemPrompt, user: userPrompt };
}
