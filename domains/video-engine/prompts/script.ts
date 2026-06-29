import { buildSystemPrompt } from "@/lib/video-engine/prompt-context";
import { ContentContext, VideoType } from "../types";

/**
 * Returns the script structure instruction based on video type.
 * Each format has a distinct narrative architecture.
 */
function getScriptStructureGuide(videoType: VideoType): string {
  const guides: Record<VideoType, string> = {
    shorts: `Structure: Ultra-tight 3-act (Hook → 1 key insight → CTA). No filler. Max 60 seconds of spoken content. Every word must earn its place.`,
    long_form: `Structure: Full narrative arc (Hook → Context → 3-5 main points with stories → Engagement → CTA → Strong close). Target 8-15 min.`,
    tutorial: `Structure: Step-by-step numbered format (Hook → What you'll learn → Step 1 → Step 2 → ... → Common mistakes → CTA). Each step = one concrete action.`,
    listicle: `Structure: Numbered list (Hook teasing the count → Brief intro → Item 1... Item N with reasons → Surprise #1 reveal → CTA). Build suspense toward the best item.`,
    documentary: `Structure: Full narrative storytelling arc (Compelling opening scene → Thesis → Rising action with evidence → Climax moment → Resolution → Call to reflection).`,
    storytelling: `Structure: Personal journey arc (Relatable situation → The struggle/conflict → Turning point → Lesson learned → How viewer can apply it → Inspirational close).`,
    faceless: `Structure: Voiceover-friendly, no personal pronouns. Use "you" and "we". (Attention-grabbing stat → Problem → Solution breakdown → Proof → CTA). Works without on-camera presence.`,
    news: `Structure: Inverted pyramid (Most important fact FIRST → Context → Background → Analysis → What this means for the viewer → CTA). Journalistic approach.`,
    podcast: `Structure: Conversational, Q&A friendly (Warm welcome → Topic intro → Deep discussion with multiple angles → Listener question segment → Key takeaways → CTA to subscribe).`,
  };
  return guides[videoType];
}

export function buildScriptPrompt(ctx: ContentContext): { system: string; user: string } {
  const systemPrompt = buildSystemPrompt(ctx);

  const userPrompt = `Write a complete, publish-ready YouTube script.

Topic: "${ctx.topic}"
Opening Hook: "${ctx.hook}"
Video Format: ${ctx.video_type}
Audience: ${ctx.audience_level} level, age group ${ctx.audience_age}
Tone: ${ctx.tone}

${getScriptStructureGuide(ctx.video_type)}

RULES:
- Use the provided hook as the EXACT opening line
- Every section must feel like the specified TONE throughout
- Language complexity must match the AUDIENCE LEVEL
- Include natural engagement triggers (e.g., "Comment below...", "Subscribe if...")
- CTA should feel organic, not forced

Return ONLY a valid JSON object:
{
  "intro": {
    "title": "Intro",
    "content": "Full intro script text (includes the hook)"
  },
  "main_content": {
    "title": "Main Content",
    "content": "The bulk of the script"
  },
  "story_flow": {
    "title": "Story / Example",
    "content": "A story or example that supports the main point"
  },
  "engagement_points": {
    "title": "Engagement Moments",
    "content": "Mid-video audience interaction lines"
  },
  "cta": {
    "title": "Call to Action",
    "content": "The CTA section"
  },
  "ending": {
    "title": "Outro",
    "content": "Final closing lines"
  },
  "estimated_duration": "e.g. '8 min' or '45 sec'",
  "reading_time_seconds": 480,
  "word_count": 1200
}`;

  return { system: systemPrompt, user: userPrompt };
}
