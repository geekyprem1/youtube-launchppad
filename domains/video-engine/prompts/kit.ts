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

Return ONLY valid JSON:
{
  "titles": [
    {
      "title": "The full YouTube title",
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

Return ONLY valid JSON:
{
  "description": "Full SEO description (200-300 words, keywords naturally integrated)",
  "cta": "Strong call to action paragraph",
  "links_placeholder": "📌 Links mentioned:\\n• [LINK 1]\\n• [LINK 2]",
  "chapters": ["00:00 - Intro", "01:30 - Main Point", "05:00 - Conclusion"]
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
Tone: ${ctx.tone}. It should drive engagement (replies, likes) and feel authentic.

Return ONLY valid JSON:
{
  "comment": "The full pinned comment text"
}`,
  };
}

// ─── Community Post ───────────────────────────────────────────────────────────
export function buildCommunityPostPrompt(ctx: ContentContext): { system: string; user: string } {
  return {
    system: buildSystemPrompt(ctx),
    user: `Write a YouTube Community Post to promote a new video about: "${ctx.topic}"
Tone: ${ctx.tone}. Should create curiosity and drive clicks on the video.

Return ONLY valid JSON:
{
  "post": "The full community post text"
}`,
  };
}

// ─── Shorts Caption ───────────────────────────────────────────────────────────
export function buildShortsCaptionPrompt(ctx: ContentContext): { system: string; user: string } {
  return {
    system: buildSystemPrompt(ctx),
    user: `Write a YouTube Shorts caption for a video about: "${ctx.topic}"
Tone: ${ctx.tone}, Video Type: ${ctx.video_type}. Should be punchy, include relevant emojis and hashtags.

Return ONLY valid JSON:
{
  "caption": "The full Shorts caption with emojis and hashtags"
}`,
  };
}

// ─── Social Promotion Kit ─────────────────────────────────────────────────────
export function buildSocialKitPrompt(ctx: ContentContext): { system: string; user: string } {
  return {
    system: buildSystemPrompt(ctx),
    user: `Write social media promotion posts for a YouTube video about: "${ctx.topic}"
Tone: ${ctx.tone}, Audience: ${ctx.audience_level} / ${ctx.audience_age}

Adapt the message style to each platform's culture.

Return ONLY valid JSON:
{
  "twitter": "Tweet (max 280 chars, punchy, hashtags)",
  "facebook": "Facebook post (2-3 sentences, conversational, call to watch)",
  "instagram": "Instagram caption (engaging, emojis, hashtags at end)",
  "linkedin": "LinkedIn post (professional insight angle, value-driven)"
}`,
  };
}
