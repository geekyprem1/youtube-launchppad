import { z } from "zod";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const VideoTypeSchema = z.enum([
  "shorts", "long_form", "documentary", "tutorial",
  "listicle", "storytelling", "faceless", "news", "podcast",
]);
export type VideoType = z.infer<typeof VideoTypeSchema>;

export const AudienceLevelSchema = z.enum(["beginner", "intermediate", "advanced"]);
export type AudienceLevel = z.infer<typeof AudienceLevelSchema>;

export const AudienceAgeSchema = z.enum(["kids", "teen", "18_25", "25_40", "40_plus"]);
export type AudienceAge = z.infer<typeof AudienceAgeSchema>;

export const ToneSchema = z.enum([
  "professional", "funny", "emotional", "motivational",
  "educational", "storytelling", "aggressive", "luxury",
]);
export type Tone = z.infer<typeof ToneSchema>;

export const LanguageSchema = z.enum([
  "English", "Hindi", "Hinglish", "Spanish", "French",
  "German", "Japanese", "Tamil", "Telugu", "Bengali",
]);
export type Language = z.infer<typeof LanguageSchema>;

export const InputTypeSchema = z.enum(["keyword", "channel"]);
export type InputType = z.infer<typeof InputTypeSchema>;

// ─── Content Context Object ───────────────────────────────────────────────────

export const ContentContextSchema = z.object({
  topic: z.string().min(1),
  language: LanguageSchema,
  video_type: VideoTypeSchema,
  audience_level: AudienceLevelSchema,
  audience_age: AudienceAgeSchema,
  tone: ToneSchema,
  hook: z.string().optional(),
  script_summary: z.string().optional(),
  session_id: z.string().uuid().optional(),
});
export type ContentContext = z.infer<typeof ContentContextSchema>;

// ─── Topic Discovery ──────────────────────────────────────────────────────────

export const TopicSchema = z.object({
  id: z.string(),
  topic: z.string(),
  confidence_score: z.number().min(0).max(100),
  trend_score: z.enum(["Low", "Medium", "High", "Viral"]),
  views_potential: z.string(),
  difficulty_score: z.enum(["Easy", "Medium", "Hard"]),
  reason: z.string(),
});
export type Topic = z.infer<typeof TopicSchema>;

export const TopicsAIResponseSchema = z.object({
  topics: z.array(
    z.object({
      topic: z.string(),
      trend_score: z.enum(["Low", "Medium", "High", "Viral"]),
      views_potential: z.string(),
      reason: z.string(),
    })
  ),
});

// ─── Hook Generator ───────────────────────────────────────────────────────────

export const HookTypeSchema = z.enum([
  "Curiosity", "Story", "Shocking Fact", "Question", "FOMO",
]);
export type HookType = z.infer<typeof HookTypeSchema>;

export const HookSchema = z.object({
  id: z.string(),
  text: z.string(),
  type: HookTypeSchema,
  confidence_score: z.number().min(0).max(100),
});
export type Hook = z.infer<typeof HookSchema>;

export const HooksAIResponseSchema = z.object({
  hooks: z.array(
    z.object({
      text: z.string(),
      type: HookTypeSchema,
      confidence_score: z.number(),
    })
  ),
});

// ─── Script Generator ─────────────────────────────────────────────────────────

export const ScriptSectionSchema = z.object({
  title: z.string(),
  content: z.string(),
});

export const ScriptSchema = z.object({
  intro: ScriptSectionSchema,
  main_content: ScriptSectionSchema,
  story_flow: ScriptSectionSchema,
  engagement_points: ScriptSectionSchema,
  cta: ScriptSectionSchema,
  ending: ScriptSectionSchema,
  estimated_duration: z.string(),
  reading_time_seconds: z.number(),
  word_count: z.number(),
});
export type Script = z.infer<typeof ScriptSchema>;

export const ScriptAIResponseSchema = ScriptSchema;

// ─── Video Kit ────────────────────────────────────────────────────────────────

export const ThumbnailBriefSchema = z.object({
  prompt: z.string(),
  headline: z.string(),
  emotion: z.string(),
  composition: z.string(),
  color_suggestions: z.array(z.string()),
});
export type ThumbnailBrief = z.infer<typeof ThumbnailBriefSchema>;

export const TitleSchema = z.object({
  title: z.string(),
  ctr_score: z.number().min(0).max(100),
  seo_score: z.number().min(0).max(100),
});
export type TitleItem = z.infer<typeof TitleSchema>;

export const TitlesAIResponseSchema = z.object({
  titles: z.array(TitleSchema),
});

export const DescriptionAIResponseSchema = z.object({
  description: z.string(),
  cta: z.string(),
  links_placeholder: z.string(),
  chapters: z.array(z.string()).optional(),
});
export type Description = z.infer<typeof DescriptionAIResponseSchema>;

export const HashtagsAIResponseSchema = z.object({
  primary: z.array(z.string()),
  secondary: z.array(z.string()),
  trending: z.array(z.string()),
});
export type Hashtags = z.infer<typeof HashtagsAIResponseSchema>;

export const KeywordsAIResponseSchema = z.object({
  primary: z.array(z.string()),
  secondary: z.array(z.string()),
  long_tail: z.array(z.string()),
});
export type Keywords = z.infer<typeof KeywordsAIResponseSchema>;

export const TagsAIResponseSchema = z.object({
  tags: z.array(z.string()),
});
export type Tags = z.infer<typeof TagsAIResponseSchema>;

export const ThumbnailPromptAIResponseSchema = z.object({
  image_prompt: z.string(),
  style_notes: z.string(),
});
export type ThumbnailPrompt = z.infer<typeof ThumbnailPromptAIResponseSchema>;

export const PinnedCommentAIResponseSchema = z.object({
  comment: z.string(),
});

export const CommunityPostAIResponseSchema = z.object({
  post: z.string(),
});

export const ShortsCaptionAIResponseSchema = z.object({
  caption: z.string(),
});

export const SocialKitAIResponseSchema = z.object({
  twitter: z.string(),
  facebook: z.string(),
  instagram: z.string(),
  linkedin: z.string(),
});
export type SocialKit = z.infer<typeof SocialKitAIResponseSchema>;

export const VideoKitSchema = z.object({
  thumbnail_brief: ThumbnailBriefSchema.optional(),
  titles: z.array(TitleSchema).optional(),
  description: DescriptionAIResponseSchema.optional(),
  hashtags: HashtagsAIResponseSchema.optional(),
  keywords: KeywordsAIResponseSchema.optional(),
  tags: TagsAIResponseSchema.optional(),
  thumbnail_prompt: ThumbnailPromptAIResponseSchema.optional(),
  pinned_comment: z.string().optional(),
  community_post: z.string().optional(),
  shorts_caption: z.string().optional(),
  social_kit: SocialKitAIResponseSchema.optional(),
});
export type VideoKit = z.infer<typeof VideoKitSchema>;

// ─── API Response ─────────────────────────────────────────────────────────────

export interface VideoEngineAPIResponse<T> {
  ok: boolean;
  step: string;
  cache_hit: boolean;
  credits_consumed: number;
  data: T;
  error?: string;
}
