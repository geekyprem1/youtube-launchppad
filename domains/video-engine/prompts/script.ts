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

  const userPrompt = `Write a complete, publish-ready YouTube script that sounds like a REAL creator talking — not like AI-generated content.

Topic: "${ctx.topic}"
Opening Hook: "${ctx.hook}"
Video Format: ${ctx.video_type}
Audience: ${ctx.audience_level} level, age group ${ctx.audience_age}
Tone: ${ctx.tone}

${getScriptStructureGuide(ctx.video_type)}

SCRIPT RULES:
- Use the provided hook as the EXACT opening line — don't change it
- Every section must feel like the specified TONE throughout
- Language complexity must match the AUDIENCE LEVEL
- Write how the creator would ACTUALLY SPEAK — not how they'd write an essay

HUMANIZATION RULES FOR SCRIPTS:
- Use contractions everywhere: "you're", "it's", "don't", "here's", "that's"
- Vary sentence length: Short. Punchy. Direct. Then occasionally a longer sentence that gives context or builds the idea.
- Transitions must sound natural, not robotic. NEVER use: "Moving on to our next point", "Now let's discuss", "In conclusion", "Furthermore"
- GOOD transitions: "But here's where it gets interesting.", "And that's only half of it.", "So what does this actually mean for you?", "Here's the thing though."
- Include natural engagement moments that don't feel scripted — e.g., "Drop a comment if you've ever done this too." not "Please engage with our content below."
- CTA must feel organic, like the creator genuinely wants to help — not forced marketing copy
- It's okay to have ONE casual aside or personal note — real creators do this

BANNED SCRIPT PHRASES (never write these):
❌ "Welcome to [Channel Name]!" — generic
❌ "In today's video, we will be exploring..." — boring
❌ "Without further ado, let's get started!" — cringe
❌ "I hope you enjoyed this video!" — hollow
❌ "Don't forget to like, comment, and subscribe!" — robotic
❌ "Moving on to our next point..." — textbook, not YouTube

Return ONLY a valid JSON object:
{
  "intro": {
    "title": "Intro",
    "content": "Full intro script text (starts with the exact hook, flows naturally into the setup)"
  },
  "main_content": {
    "title": "Main Content",
    "content": "The bulk of the script — conversational, specific, human. No lecture mode."
  },
  "story_flow": {
    "title": "Story / Example",
    "content": "A real, specific story or example — not generic. Make it feel like something the creator actually experienced or witnessed."
  },
  "engagement_points": {
    "title": "Engagement Moments",
    "content": "Natural mid-video moments where the creator connects with the audience — feels like a real conversation, not scripted interaction prompts"
  },
  "cta": {
    "title": "Call to Action",
    "content": "Organic CTA that feels like the creator genuinely wants to help — not a marketing pitch"
  },
  "ending": {
    "title": "Outro",
    "content": "Closing lines that feel real and warm, not robotic sign-off"
  },
  "estimated_duration": "e.g. '8 min' or '45 sec'",
  "reading_time_seconds": 480,
  "word_count": 1200
}`;

  return { system: systemPrompt, user: userPrompt };
}
