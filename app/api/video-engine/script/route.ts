import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateAIResponse } from "@/core/openrouter";
import { validateAIResponse } from "@/core/validation";
import { buildScriptPrompt } from "@/domains/video-engine/prompts/script";
import { buildCacheKey, readCache, writeCache } from "@/domains/video-engine/cache";
import { getScriptTokenBudget, getDurationLabel } from "@/domains/video-engine/scoring";
import { ScriptAIResponseSchema, ContentContextSchema } from "@/domains/video-engine/types";
import { logError } from "@/core/logger";

const FALLBACK_SCRIPT = {
  intro: { title: "Intro", content: "Welcome to this video. Today we're diving deep into a topic that will change how you think..." },
  main_content: { title: "Main Content", content: "Here's what you need to know about this topic..." },
  story_flow: { title: "Story / Example", content: "Let me share a story that illustrates this perfectly..." },
  engagement_points: { title: "Engagement", content: "What do you think about this? Drop your thoughts in the comments below..." },
  cta: { title: "Call to Action", content: "If this video helped you, please like and subscribe..." },
  ending: { title: "Outro", content: "Thanks for watching. I'll see you in the next one." },
  estimated_duration: "5 min",
  reading_time_seconds: 300,
  word_count: 600,
};

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const ctx = ContentContextSchema.parse(body);

    if (!ctx.hook) {
      return NextResponse.json({ error: "Hook is required for script generation" }, { status: 400 });
    }

    // Credit check (2 credits for script) — skip gracefully if column not yet migrated
    const { data: profile } = await supabase
      .from("profiles")
      .select("video_engine_credits")
      .eq("id", user.id)
      .single();

    const credits = profile?.video_engine_credits;
    if (typeof credits === "number" && credits < 2) {
      return NextResponse.json({ error: "Insufficient credits" }, { status: 402 });
    }

    // Cache check
    const cacheKey = buildCacheKey("script", {
      topic: ctx.topic, hook: ctx.hook, language: ctx.language,
      video_type: ctx.video_type, tone: ctx.tone,
      audience_level: ctx.audience_level, audience_age: ctx.audience_age,
    });
    const cached = await readCache(cacheKey);
    if (cached) {
      return NextResponse.json({ ok: true, step: "script", cache_hit: true, credits_consumed: 0, data: { script: cached } });
    }

    // Dynamic token budget based on video type
    const maxTokens = getScriptTokenBudget(ctx.video_type);

    // AI Call — use Pro model for script quality
    const { system, user: userPrompt } = buildScriptPrompt(ctx);
    const rawResponse = await generateAIResponse(
      [
        { role: "system", content: system },
        { role: "user", content: userPrompt },
      ],
      {
        json: true,
        promptVersion: "video-engine.script.v1",
        max_tokens: maxTokens,
        model: "google/gemini-2.5-pro",
      }
    );

    const script = validateAIResponse(rawResponse, ScriptAIResponseSchema, FALLBACK_SCRIPT);

    // Derive duration label from actual word count + video type
    const duration = getDurationLabel(script.word_count, ctx.video_type);
    const enrichedScript = { ...script, estimated_duration: duration };

    // Cache + deduct 2 credits only if column exists
    await writeCache(cacheKey, "script", enrichedScript);
    if (typeof credits === "number") {
      await supabase
        .from("profiles")
        .update({ video_engine_credits: credits - 2 })
        .eq("id", user.id);
    }

    return NextResponse.json({
      ok: true, step: "script", cache_hit: false, credits_consumed: 2,
      data: { script: enrichedScript },
    });

  } catch (err) {
    logError("VE_SCRIPT", err);
    return NextResponse.json({ error: "Failed to generate script" }, { status: 500 });
  }
}
