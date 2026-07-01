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

HOOK QUALITY RULES:
- Think like a TOP YouTuber writing their opening line — not an AI generating a template
- The hook must make someone STOP scrolling in the first 2 seconds
- Be SPECIFIC to the topic — no generic hooks that could apply to any video
- Use the creator's natural voice — contractions, direct address, confident opinions

BAD HOOK EXAMPLES (never write like this):
❌ "Have you ever wondered about [topic]?" — too generic
❌ "In today's video, we're going to explore..." — boring, skipped instantly
❌ "Welcome back! Today we dive deep into..." — cliché YouTuber opener
❌ "Are you ready to transform your life with...?" — cheesy and unspecific

GOOD HOOK EXAMPLES (write like this):
✅ "I wasted 3 years doing this wrong. Here's what actually works." — specific, personal, creates urgency
✅ "Nobody talks about the real reason most people fail at this." — bold, curiosity-inducing
✅ "I grew from 0 to 50K subscribers doing one thing differently than everyone else." — specific claim, believable
✅ "Stop. Before you do this, watch the first 60 seconds of this video." — commands attention immediately

Return ONLY a valid JSON object with this exact schema:
{
  "hooks": [
    {
      "text": "The full hook line exactly as it would be spoken — specific, punchy, human",
      "type": "Curiosity" | "Story" | "Shocking Fact" | "Question" | "FOMO",
      "confidence_score": 0-100
    }
  ]
}`;

  return { system: systemPrompt, user: userPrompt };
}
