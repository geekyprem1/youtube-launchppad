import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { callAI } from "@/lib/openrouter";
import { searchVideos } from "@/lib/youtube";
import { safeJsonParse } from "@/lib/utils";
import { checkLimit, incrementUsage } from "@/lib/planLimits";
import { UPGRADE_MESSAGES } from "@/lib/plans";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { keyword } = await req.json();
    if (!keyword?.trim()) return NextResponse.json({ error: "Keyword is required" }, { status: 400 });

    const limit = await checkLimit(user.id, "keywords_per_day");
    if (!limit.allowed) {
      return NextResponse.json({
        error: UPGRADE_MESSAGES.keywords_per_day, limitReached: true,
        used: limit.used, limit: limit.limit, plan: limit.plan,
      }, { status: 429 });
    }

    const ytResults = await searchVideos(keyword, 5);
    const topVideos = ytResults.items?.map((v: {
      snippet: { title: string; channelTitle: string };
    }) => `"${v.snippet.title}" by ${v.snippet.channelTitle}`).join("\n") || "";

    const prompt = `You are a YouTube SEO expert. Research the keyword/topic: "${keyword}"

Current top YouTube results for this keyword:
${topVideos || "No results found"}

Provide comprehensive keyword research. Return ONLY valid JSON:
{
  "primary_keyword": "best main keyword to target",
  "opportunity_score": number 0-100,
  "competition": "low" | "medium" | "high",
  "estimated_monthly_searches": "range like '10K-50K' or '1K-10K'",
  "related_keywords": [
    {"keyword": "related keyword 1", "competition": "low/medium/high", "opportunity": number},
    {"keyword": "related keyword 2", "competition": "low/medium/high", "opportunity": number},
    {"keyword": "related keyword 3", "competition": "low/medium/high", "opportunity": number},
    {"keyword": "related keyword 4", "competition": "low/medium/high", "opportunity": number},
    {"keyword": "related keyword 5", "competition": "low/medium/high", "opportunity": number},
    {"keyword": "related keyword 6", "competition": "low/medium/high", "opportunity": number},
    {"keyword": "related keyword 7", "competition": "low/medium/high", "opportunity": number},
    {"keyword": "related keyword 8", "competition": "low/medium/high", "opportunity": number}
  ],
  "long_tail_keywords": ["long tail 1", "long tail 2", "long tail 3", "long tail 4"],
  "content_angle": "best angle or hook to rank for this keyword",
  "suggested_titles": [
    "title idea 1 using these keywords",
    "title idea 2 using these keywords",
    "title idea 3 using these keywords"
  ],
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5", "tag6", "tag7", "tag8"],
  "advice": "one key piece of strategic advice for ranking on this keyword"
}`;

    const raw = await callAI(
      [{ role: "user", content: prompt }],
      { json: true, temperature: 0.3, max_tokens: 2000 }
    );

    const result = safeJsonParse(raw, {});

    await incrementUsage(user.id, "keywords_per_day");
    await supabase.from("keyword_searches").insert({
      user_id: user.id,
      keyword: keyword.trim(),
      result,
    });

    return NextResponse.json({ result });
  } catch (err) {
    console.error("Keywords API error:", err);
    return NextResponse.json({ error: "Failed to research keyword" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data } = await supabase
      .from("keyword_searches")
      .select("id, keyword, result, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);

    return NextResponse.json({ history: data || [] });
  } catch {
    return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 });
  }
}
