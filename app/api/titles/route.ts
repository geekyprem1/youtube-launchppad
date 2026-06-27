import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { callAI } from "@/lib/openrouter";
import { safeJsonParse } from "@/lib/utils";
import { checkLimit, incrementUsage } from "@/lib/planLimits";
import { UPGRADE_MESSAGES } from "@/lib/plans";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { title } = await req.json();
    if (!title?.trim()) return NextResponse.json({ error: "Title is required" }, { status: 400 });

    const limit = await checkLimit(user.id, "titles_per_day");
    if (!limit.allowed) {
      return NextResponse.json({
        error: UPGRADE_MESSAGES.titles_per_day, limitReached: true,
        used: limit.used, limit: limit.limit, plan: limit.plan,
      }, { status: 429 });
    }

    const prompt = `You are a YouTube CTR and SEO expert. Analyze this YouTube video title: "${title}"

Provide a comprehensive analysis and return ONLY valid JSON:
{
  "overall_score": number 0-100,
  "ctr_score": number 0-100,
  "seo_score": number 0-100,
  "emotional_score": number 0-100,
  "length_score": number 0-100,
  "strengths": ["strength1", "strength2", "strength3"],
  "weaknesses": ["weakness1", "weakness2"],
  "improvements": ["specific tip 1", "specific tip 2", "specific tip 3"],
  "alternatives": [
    {"title": "alternative title 1", "why": "brief reason"},
    {"title": "alternative title 2", "why": "brief reason"},
    {"title": "alternative title 3", "why": "brief reason"},
    {"title": "alternative title 4", "why": "brief reason"},
    {"title": "alternative title 5", "why": "brief reason"}
  ],
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "verdict": "one sentence overall verdict"
}

Scoring guide:
- CTR: Is it clickable? Does it create curiosity? Power words?
- SEO: Does it contain searchable keywords? Good length (50-70 chars)?
- Emotional: Does it trigger curiosity, fear, desire, or excitement?
- Length: Ideal is 50-70 characters`;

    const raw = await callAI(
      [{ role: "user", content: prompt }],
      { json: true, temperature: 0.4, max_tokens: 1500 }
    );

    const result = safeJsonParse(raw, {});

    await incrementUsage(user.id, "titles_per_day");
    await supabase.from("title_scores").insert({
      user_id: user.id,
      title: title.trim(),
      result,
    });

    return NextResponse.json({ result });
  } catch (err) {
    console.error("Titles API error:", err);
    return NextResponse.json({ error: "Failed to analyze title" }, { status: 500 });
  }
}
