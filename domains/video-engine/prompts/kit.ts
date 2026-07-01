import { buildSystemPrompt } from "@/lib/video-engine/prompt-context";
import { ContentContext } from "../types";

// ─── Thumbnail Brief ──────────────────────────────────────────────────────────
export function buildThumbnailPrompt(ctx: ContentContext): { system: string; user: string } {
  return {
    system: buildSystemPrompt(ctx),
    user: `Create a YouTube thumbnail brief for:
Topic: "${ctx.topic}"
Tone: ${ctx.tone}, Video Type: ${ctx.video_type}

Return ONLY valid JSON:
{
  "prompt": "Visual description for a designer",
  "headline": "Bold text to overlay on thumbnail (max 5 words)",
  "emotion": "The primary emotion this thumbnail should evoke",
  "composition": "Layout description (e.g., 'Split screen: shocked face left, product right')",
  "color_suggestions": ["#hex1", "#hex2", "#hex3"]
}`,
  };
}

// ─── Title Generator ──────────────────────────────────────────────────────────
export function buildTitlesPrompt(ctx: ContentContext): { system: string; user: string } {
  return {
    system: buildSystemPrompt(ctx),
    user: `Generate 5 SEO-optimized YouTube titles for:
Topic: "${ctx.topic}"
Tone: ${ctx.tone}, Audience: ${ctx.audience_level} / ${ctx.audience_age}

Each title should use a different emotional or structural angle (curiosity gap, number, how-to, story, power word).

TITLE QUALITY RULES:
- Write titles like real top-performing YouTubers write them — specific, punchy, human
- Be SPECIFIC to the topic — no generic titles that could apply to anything
- Use numbers when they add credibility ("I tried this for 30 days", "7 things nobody tells you")
- Create a clear curiosity gap without being clickbait — the title must deliver on its promise
- Contractions are fine: "You're", "I've", "It's", "Here's"

BAD TITLE EXAMPLES (never write like this):
❌ "Unlocking the Power of [Topic]: A Comprehensive Guide" — corporate, boring
❌ "Everything You Need to Know About [Topic]" — vague, overused
❌ "The Ultimate Guide to [Topic] in [Year]" — template-sounding

GOOD TITLE EXAMPLES (write like this):
✅ "I Tried This for 30 Days and Lost 12kg. Here's What Happened."
✅ "Why 95% of Beginners Quit (And How to Not Be One of Them)"
✅ "The One Mistake That's Killing Your YouTube Channel"

Return ONLY valid JSON:
{
  "titles": [
    {
      "title": "The full YouTube title — specific, human, clickable",
      "ctr_score": 0-100,
      "seo_score": 0-100
    }
  ]
}`,
  };
}

// ─── Description ─────────────────────────────────────────────────────────────
export function buildDescriptionPrompt(ctx: ContentContext): { system: string; user: string } {
  return {
    system: buildSystemPrompt(ctx),
    user: `Write a complete, SEO-optimized YouTube description for:
Topic: "${ctx.topic}"
Hook used: "${ctx.hook}"
Tone: ${ctx.tone}, Video Type: ${ctx.video_type}

DESCRIPTION RULES:
- Sound like a real creator wrote this — NOT like an SEO tool or marketing agency
- The opening sentence must hook the reader (build on the video hook naturally)
- Keywords should feel naturally woven in — not stuffed in awkwardly
- Use the creator's natural voice: contractions, direct language, occasional personality
- The CTA should feel genuine — like the creator actually wants the viewer to engage, not a copy-paste CTA
- Chapters should reflect what's actually in the video, with descriptive names (not just "Part 1", "Part 2")

Return ONLY valid JSON:
{
  "description": "Full description (200-300 words) — reads like a real creator wrote it, keywords feel natural",
  "cta": "Genuine call to action that doesn't sound like a robot — specific, warm, and direct",
  "links_placeholder": "📌 Links mentioned:\\n• [LINK 1]\\n• [LINK 2]",
  "chapters": ["00:00 - Intro", "01:30 - [Specific point name]", "05:00 - [Specific point name]"]
}`,
  };
}

// ─── Hashtags ─────────────────────────────────────────────────────────────────
export function buildHashtagsPrompt(ctx: ContentContext): { system: string; user: string } {
  return {
    system: buildSystemPrompt(ctx),
    user: `Generate YouTube hashtags for:
Topic: "${ctx.topic}", Video Type: ${ctx.video_type}

Return ONLY valid JSON:
{
  "primary": ["#hashtag1", "#hashtag2", "#hashtag3"],
  "secondary": ["#hashtag4", "#hashtag5", "#hashtag6", "#hashtag7"],
  "trending": ["#trending1", "#trending2", "#trending3"]
}`,
  };
}

// ─── Keywords ─────────────────────────────────────────────────────────────────
export function buildKeywordsPrompt(ctx: ContentContext): { system: string; user: string } {
  return {
    system: buildSystemPrompt(ctx),
    user: `Generate YouTube SEO keywords for:
Topic: "${ctx.topic}", Audience: ${ctx.audience_level} / ${ctx.audience_age}

Return ONLY valid JSON:
{
  "primary": ["keyword1", "keyword2"],
  "secondary": ["keyword3", "keyword4", "keyword5"],
  "long_tail": ["long tail phrase 1", "long tail phrase 2", "long tail phrase 3"]
}`,
  };
}

// ─── Tags ─────────────────────────────────────────────────────────────────────
export function buildTagsPrompt(ctx: ContentContext): { system: string; user: string } {
  return {
    system: buildSystemPrompt(ctx),
    user: `Generate 20 YouTube tags for: "${ctx.topic}"

Return ONLY valid JSON:
{
  "tags": ["tag1", "tag2", "tag3", ...]
}`,
  };
}

// ─── Thumbnail AI Image Prompt ────────────────────────────────────────────────
export function buildThumbnailImagePromptPrompt(ctx: ContentContext): { system: string; user: string } {
  return {
    system: buildSystemPrompt(ctx),
    user: `Write a detailed AI image generation prompt for a YouTube thumbnail.
Topic: "${ctx.topic}", Tone: ${ctx.tone}, Audience age: ${ctx.audience_age}

Return ONLY valid JSON:
{
  "image_prompt": "Detailed prompt for DALL-E / Midjourney / Stable Diffusion (describe style, colors, composition, subject, mood)",
  "style_notes": "Additional style guidance for the designer"
}`,
  };
}

// ─── Pinned Comment ───────────────────────────────────────────────────────────
export function buildPinnedCommentPrompt(ctx: ContentContext): { system: string; user: string } {
  return {
    system: buildSystemPrompt(ctx),
    user: `Write an engaging pinned comment for a YouTube video about: "${ctx.topic}"
Tone: ${ctx.tone}. It should drive replies and likes.

PINNED COMMENT RULES:
- Must feel like a REAL PERSON wrote this, not a bot or a brand
- Ask a genuine question the creator would actually want to know (not "What did you think of this video?")
- Be specific to the video topic — the question should only make sense for THIS video
- Keep it short: 1-2 sentences max + the question
- Casual, warm tone — like texting a friend, not writing a press release
- Emojis are fine if they feel natural for the tone

BAD: "Thanks for watching! Let me know your thoughts in the comments below! 👇"
GOOD: "Real talk — which of these mistakes have YOU made? I've made all 5 lol 😅 Drop your answer below, I'm reading every reply."

Return ONLY valid JSON:
{
  "comment": "The full pinned comment — specific, warm, genuinely invites a reply"
}`,
  };
}

// ─── Community Post ───────────────────────────────────────────────────────────
export function buildCommunityPostPrompt(ctx: ContentContext): { system: string; user: string } {
  return {
    system: buildSystemPrompt(ctx),
    user: `Write a YouTube Community Post to promote a new video about: "${ctx.topic}"
Tone: ${ctx.tone}. Should create curiosity and drive clicks.

COMMUNITY POST RULES:
- Write like a real creator talking to their community — casual, genuine, a bit excited
- DON'T just announce the video. Create CURIOSITY about what's in it.
- Tease one specific thing from the video without giving it away
- Feel free to be a bit vulnerable or personal — that's what works on community posts
- Ask a question at the end to encourage replies
- Keep it under 150 words — community posts that are too long get skipped
- No corporate language, no "I'm thrilled to announce", no "Check out my latest content"

Return ONLY valid JSON:
{
  "post": "The full community post — casual, curious, real. Makes people want to click."
}`,
  };
}

// ─── Shorts Caption ───────────────────────────────────────────────────────────
export function buildShortsCaptionPrompt(ctx: ContentContext): { system: string; user: string } {
  return {
    system: buildSystemPrompt(ctx),
    user: `Write a YouTube Shorts caption for a video about: "${ctx.topic}"
Tone: ${ctx.tone}, Video Type: ${ctx.video_type}.

SHORTS CAPTION RULES:
- First line is the HOOK — it must stop the scroll in under 2 seconds
- Ultra punchy, no fluff, every word earns its place
- Emojis should enhance the message, not just decorate it
- Hashtags: 3-5 max, actually relevant ones (not just #viral #trending)
- The whole caption including hashtags should fit in under 100 characters if possible
- Sound like a real creator, not a brand account

Return ONLY valid JSON:
{
  "caption": "First line hook. Rest of caption. #relevant #hashtags"
}`,
  };
}

// ─── Social Promotion Kit ─────────────────────────────────────────────────────
export function buildSocialKitPrompt(ctx: ContentContext): { system: string; user: string } {
  return {
    system: buildSystemPrompt(ctx),
    user: `Write social media promotion posts for a YouTube video about: "${ctx.topic}"
Tone: ${ctx.tone}, Audience: ${ctx.audience_level} / ${ctx.audience_age}

SOCIAL KIT RULES — adapt to each platform's authentic culture:

Twitter/X: Bold, opinionated, maybe slightly controversial. Real people on Twitter share HOT TAKES, not press releases. Under 220 chars so there's room for a link. 1-2 hashtags max.

Facebook: Conversational and warm, like sharing something with friends. 2-3 sentences. Ask a relatable question. Feels like a real person, not a brand page.

Instagram: Start strong (first line before "more" is cut off). Emojis that actually add meaning. Story-driven or curiosity-based. Hashtags at the very end, 5-10 relevant ones.

LinkedIn: Professional but HUMAN — not a press release. Share a genuine insight or lesson from the video. First-person perspective. Ends with a thoughtful question that invites professional discussion. No cringe "excited to share" openers.

Return ONLY valid JSON:
{
  "twitter": "Hot take or bold claim — punchy, real, max 220 chars + 1-2 hashtags",
  "facebook": "Warm, conversational, asks a relatable question — sounds like a real person sharing something",
  "instagram": "Hook first line. Genuine caption. #relevant #hashtags #at #end",
  "linkedin": "Genuine professional insight from the video. First-person. Ends with a real question."
}`,
  };
}
