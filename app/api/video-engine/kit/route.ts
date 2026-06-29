import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateAIResponse } from "@/core/openrouter";
import { validateAIResponse } from "@/core/validation";
import { buildCacheKey, readCache, writeCache } from "@/domains/video-engine/cache";
import { ContentContextSchema } from "@/domains/video-engine/types";
import { logError } from "@/core/logger";
import {
  buildThumbnailPrompt,
  buildTitlesPrompt,
  buildDescriptionPrompt,
  buildHashtagsPrompt,
  buildKeywordsPrompt,
  buildTagsPrompt,
  buildThumbnailImagePromptPrompt,
  buildPinnedCommentPrompt,
  buildCommunityPostPrompt,
  buildShortsCaptionPrompt,
  buildSocialKitPrompt,
} from "@/domains/video-engine/prompts/kit";
import { z } from "zod";
import {
  ThumbnailBriefSchema, TitlesAIResponseSchema, DescriptionAIResponseSchema,
  HashtagsAIResponseSchema, KeywordsAIResponseSchema, TagsAIResponseSchema,
  ThumbnailPromptAIResponseSchema, PinnedCommentAIResponseSchema,
  CommunityPostAIResponseSchema, ShortsCaptionAIResponseSchema, SocialKitAIResponseSchema,
} from "@/domains/video-engine/types";

interface KitModule {
  key: string;
  promptBuilder: (ctx: any) => { system: string; user: string };
  schema: z.ZodSchema<any>;
  fallback: any;
  transform?: (parsed: any) => any;
}

const KIT_MODULES: KitModule[] = [
  {
    key: "thumbnail_brief",
    promptBuilder: buildThumbnailPrompt,
    schema: ThumbnailBriefSchema,
    fallback: { prompt: "Eye-catching thumbnail", headline: "MUST WATCH", emotion: "Surprise", composition: "Bold text overlay", color_suggestions: ["#FF6B35", "#1A1A2E", "#FFFFFF"] },
  },
  {
    key: "titles",
    promptBuilder: buildTitlesPrompt,
    schema: TitlesAIResponseSchema,
    fallback: { titles: [{ title: "You Won't Believe This", ctr_score: 75, seo_score: 70 }] },
    transform: (p) => p.titles,
  },
  {
    key: "description",
    promptBuilder: buildDescriptionPrompt,
    schema: DescriptionAIResponseSchema,
    fallback: { description: "Watch this video to learn everything you need to know.", cta: "Like and Subscribe!", links_placeholder: "📌 Links:\n• [LINK]", chapters: [] },
  },
  {
    key: "hashtags",
    promptBuilder: buildHashtagsPrompt,
    schema: HashtagsAIResponseSchema,
    fallback: { primary: ["#youtube", "#viral"], secondary: ["#content", "#creator"], trending: ["#trending"] },
  },
  {
    key: "keywords",
    promptBuilder: buildKeywordsPrompt,
    schema: KeywordsAIResponseSchema,
    fallback: { primary: ["main keyword"], secondary: ["secondary keyword"], long_tail: ["long tail keyword phrase"] },
  },
  {
    key: "tags",
    promptBuilder: buildTagsPrompt,
    schema: TagsAIResponseSchema,
    fallback: { tags: ["youtube", "video", "content"] },
    transform: (p) => p.tags,
  },
  {
    key: "thumbnail_prompt",
    promptBuilder: buildThumbnailImagePromptPrompt,
    schema: ThumbnailPromptAIResponseSchema,
    fallback: { image_prompt: "Vibrant thumbnail with bold text overlay", style_notes: "High contrast, readable at small size" },
  },
  {
    key: "pinned_comment",
    promptBuilder: buildPinnedCommentPrompt,
    schema: PinnedCommentAIResponseSchema,
    fallback: { comment: "Thanks for watching! What was your biggest takeaway? Comment below 👇" },
    transform: (p) => p.comment,
  },
  {
    key: "community_post",
    promptBuilder: buildCommunityPostPrompt,
    schema: CommunityPostAIResponseSchema,
    fallback: { post: "New video is out! Go check it out 🔥" },
    transform: (p) => p.post,
  },
  {
    key: "shorts_caption",
    promptBuilder: buildShortsCaptionPrompt,
    schema: ShortsCaptionAIResponseSchema,
    fallback: { caption: "This changed everything 🔥 #shorts #viral" },
    transform: (p) => p.caption,
  },
  {
    key: "social_kit",
    promptBuilder: buildSocialKitPrompt,
    schema: SocialKitAIResponseSchema,
    fallback: { twitter: "New video out! 🔥", facebook: "Check out my latest video!", instagram: "New video 🎬 #youtube", linkedin: "Excited to share my latest content." },
  },
];

async function runKitModule(module: KitModule, ctx: any, cachePrefix: string) {
  const cacheKey = buildCacheKey(`kit.${module.key}`, {
    topic: ctx.topic, language: ctx.language, video_type: ctx.video_type,
    tone: ctx.tone, audience_level: ctx.audience_level, audience_age: ctx.audience_age,
    hook: ctx.hook ?? "",
  });

  const cached = await readCache(cacheKey);
  if (cached) return { key: module.key, data: cached, cache_hit: true };

  const { system, user } = module.promptBuilder(ctx);
  const raw = await generateAIResponse(
    [{ role: "system", content: system }, { role: "user", content: user }],
    { json: true, promptVersion: `video-engine.kit.${module.key}.v1`, max_tokens: 600 }
  );

  const parsed = validateAIResponse(raw, module.schema, module.fallback);
  const data = module.transform ? module.transform(parsed) : parsed;

  await writeCache(cacheKey, `kit.${module.key}`, data);
  return { key: module.key, data, cache_hit: false };
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const ctx = ContentContextSchema.parse(body);

    // Credit check (3 credits for full kit) — skip gracefully if column not yet migrated
    const { data: profile } = await supabase
      .from("profiles")
      .select("video_engine_credits")
      .eq("id", user.id)
      .single();

    const credits = profile?.video_engine_credits;
    if (typeof credits === "number" && credits < 3) {
      return NextResponse.json({ error: "Insufficient credits" }, { status: 402 });
    }

    // Run all 11 kit modules in parallel
    const results = await Promise.allSettled(
      KIT_MODULES.map((m) => runKitModule(m, ctx, user.id))
    );

    // Compile results — each section succeeds or fails independently
    const kit: Record<string, any> = {};
    let successCount = 0;
    let failCount = 0;

    results.forEach((result, i) => {
      const key = KIT_MODULES[i].key;
      if (result.status === "fulfilled") {
        kit[key] = result.value.data;
        successCount++;
      } else {
        kit[key] = null; // null signals error to client — retry button shows
        failCount++;
        logError(`VE_KIT_${key.toUpperCase()}`, result.reason);
      }
    });

    // Deduct 3 credits only if column exists
    if (typeof credits === "number") {
      await supabase
        .from("profiles")
        .update({ video_engine_credits: credits - 3 })
        .eq("id", user.id);
    }

    // Persist kit to session
    if (ctx.session_id) {
      await supabase
        .from("video_engine_sessions")
        .update({ video_kit: kit, status: "completed" })
        .eq("id", ctx.session_id)
        .eq("user_id", user.id);
    }

    return NextResponse.json({
      ok: true,
      step: "kit",
      cache_hit: false,
      credits_consumed: 3,
      data: { kit, success_count: successCount, fail_count: failCount },
    });

  } catch (err) {
    logError("VE_KIT", err);
    return NextResponse.json({ error: "Failed to generate video kit" }, { status: 500 });
  }
}
