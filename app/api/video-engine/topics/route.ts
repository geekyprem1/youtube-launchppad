import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateAIResponse } from "@/core/openrouter";
import { validateAIResponse } from "@/core/validation";
import { buildTopicsPrompt } from "@/domains/video-engine/prompts/topics-hooks";
import { buildCacheKey, readCache, writeCache } from "@/domains/video-engine/cache";
import { simulateNicheFeatures, scoreTopicOpportunity } from "@/domains/video-engine/scoring";
import { TopicsAIResponseSchema, TopicSchema } from "@/domains/video-engine/types";
import { logError } from "@/core/logger";

const FALLBACK_TOPICS = {
  topics: [
    { topic: "Top 10 Trends to Watch This Year", trend_score: "High", views_potential: "50K–200K", reason: "Broad appeal, high search intent, excellent shareability." },
    { topic: "How to Get Started With No Experience", trend_score: "High", views_potential: "30K–100K", reason: "Beginner content always earns consistent long-term views." },
    { topic: "Common Mistakes Everyone Makes (And How to Fix Them)", trend_score: "Medium", views_potential: "20K–80K", reason: "Problem-solution format drives clicks and watch time." },
  ],
};

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { input_type, keyword, channel_id, niche } = body;

    const input = keyword || niche || "general YouTube content";

    // Credit check — skip gracefully if column not yet migrated
    const { data: profile } = await supabase
      .from("profiles")
      .select("video_engine_credits")
      .eq("id", user.id)
      .single();

    const credits = profile?.video_engine_credits;
    // Only block if credits column exists AND is explicitly 0
    if (typeof credits === "number" && credits < 1) {
      return NextResponse.json({ error: "Insufficient credits" }, { status: 402 });
    }

    // Cache check
    const cacheKey = buildCacheKey("topics", { input, input_type });
    const cached = await readCache<typeof FALLBACK_TOPICS>(cacheKey);

    if (cached) {
      const features = simulateNicheFeatures(input);
      const topics = cached.topics.map((t, i) => {
        const { confidence, difficulty, opportunity } = scoreTopicOpportunity(features);
        return {
          id: String(i + 1),
          topic: t.topic,
          confidence_score: confidence,
          trend_score: t.trend_score,
          views_potential: t.views_potential,
          difficulty_score: difficulty,
          reason: t.reason,
        };
      });
      return NextResponse.json({ ok: true, step: "topics", cache_hit: true, credits_consumed: 0, data: { topics } });
    }

    // AI Call
    const prompt = buildTopicsPrompt(input, input_type || "keyword");
    const rawResponse = await generateAIResponse(
      [{ role: "user", content: prompt }],
      { json: true, promptVersion: "video-engine.topics.v1", max_tokens: 1500 }
    );

    const parsed = validateAIResponse(rawResponse, TopicsAIResponseSchema, FALLBACK_TOPICS);

    // Score each topic
    const features = simulateNicheFeatures(input);
    const topics = parsed.topics.map((t, i) => {
      const { confidence, difficulty, opportunity } = scoreTopicOpportunity({
        ...features,
        trend: t.trend_score === "Viral" ? 95 : t.trend_score === "High" ? 75 : t.trend_score === "Medium" ? 50 : 25,
      });
      return {
        id: String(i + 1),
        topic: t.topic,
        confidence_score: confidence,
        trend_score: t.trend_score,
        views_potential: t.views_potential,
        difficulty_score: difficulty,
        reason: t.reason,
      };
    });

    // Write cache + deduct credit only if column exists
    await writeCache(cacheKey, "topics", parsed);
    if (typeof credits === "number") {
      await supabase
        .from("profiles")
        .update({ video_engine_credits: credits - 1 })
        .eq("id", user.id);
    }

    return NextResponse.json({
      ok: true,
      step: "topics",
      cache_hit: false,
      credits_consumed: 1,
      data: { topics },
    });

  } catch (err) {
    logError("VE_TOPICS", err);
    return NextResponse.json({ error: "Failed to generate topics" }, { status: 500 });
  }
}
