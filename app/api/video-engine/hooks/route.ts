import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateAIResponse } from "@/core/openrouter";
import { validateAIResponse } from "@/core/validation";
import { buildHooksPrompt } from "@/domains/video-engine/prompts/topics-hooks";
import { buildCacheKey, readCache, writeCache } from "@/domains/video-engine/cache";
import { scoreHookConfidence } from "@/domains/video-engine/scoring";
import { HooksAIResponseSchema, ContentContextSchema } from "@/domains/video-engine/types";
import { logError } from "@/core/logger";

const FALLBACK_HOOKS = {
  hooks: [
    { text: "What if everything you know about this is wrong?", type: "Curiosity" as const, confidence_score: 82 },
    { text: "Last year, I made a mistake that cost me everything — here's what happened.", type: "Story" as const, confidence_score: 78 },
    { text: "90% of people fail at this for one simple reason.", type: "Shocking Fact" as const, confidence_score: 85 },
    { text: "What would you do if you had only one shot to get this right?", type: "Question" as const, confidence_score: 76 },
    { text: "Everyone's doing this right now — and you're missing out.", type: "FOMO" as const, confidence_score: 80 },
  ],
};

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const ctx = ContentContextSchema.parse(body);

    // Credit check — skip for paid plans, skip gracefully if column not yet migrated
    const { data: profile } = await supabase
      .from("profiles")
      .select("video_engine_credits, plan_type")
      .eq("id", user.id)
      .single();

    const credits = profile?.video_engine_credits;
    const planType = profile?.plan_type || "free";
    const isUnlimitedPlan = ["pro", "elite", "creator_pro", "ultimate"].includes(planType);

    if (!isUnlimitedPlan && typeof credits === "number" && credits < 1) {
      return NextResponse.json({ error: "Insufficient credits" }, { status: 402 });
    }

    // Cache check
    const cacheKey = buildCacheKey("hooks", {
      topic: ctx.topic, language: ctx.language,
      video_type: ctx.video_type, tone: ctx.tone,
      audience_level: ctx.audience_level, audience_age: ctx.audience_age,
    });
    const cached = await readCache<typeof FALLBACK_HOOKS>(cacheKey);

    if (cached) {
      const hooks = cached.hooks.map((h, i) => ({ id: String(i + 1), ...h }));
      return NextResponse.json({ ok: true, step: "hooks", cache_hit: true, credits_consumed: 0, data: { hooks } });
    }

    // AI Call
    const { system, user: userPrompt } = buildHooksPrompt(ctx);
    const rawResponse = await generateAIResponse(
      [
        { role: "system", content: system },
        { role: "user", content: userPrompt },
      ],
      { json: true, promptVersion: "video-engine.hooks.v1", max_tokens: 800 }
    );

    const parsed = validateAIResponse(rawResponse, HooksAIResponseSchema, FALLBACK_HOOKS);

    const hooks = parsed.hooks.map((h, i) => ({
      id: String(i + 1),
      text: h.text,
      type: h.type,
      confidence_score: scoreHookConfidence(h.type, 70),
    }));

    // Cache + deduct credit only if column exists
    await writeCache(cacheKey, "hooks", { hooks: parsed.hooks });
    if (!isUnlimitedPlan && typeof credits === "number") {
      await supabase
        .from("profiles")
        .update({ video_engine_credits: credits - 1 })
        .eq("id", user.id);
    }

    return NextResponse.json({ ok: true, step: "hooks", cache_hit: false, credits_consumed: 1, data: { hooks } });

  } catch (err) {
    logError("VE_HOOKS", err);
    return NextResponse.json({ error: "Failed to generate hooks" }, { status: 500 });
  }
}
