import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { callAI } from "@/lib/openrouter";
import { extractVideoId, getVideoInfo, formatDuration, formatCount } from "@/lib/youtube";
import { safeJsonParse } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { videoUrl } = await req.json();
    if (!videoUrl?.trim()) return NextResponse.json({ error: "Video URL is required" }, { status: 400 });

    const videoId = extractVideoId(videoUrl);
    if (!videoId) return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 });

    const ytData = await getVideoInfo(videoId);
    const video = ytData.items?.[0];
    if (!video) return NextResponse.json({ error: "Video not found" }, { status: 404 });

    const { snippet, statistics, contentDetails } = video;
    const duration = formatDuration(contentDetails.duration);
    const views = formatCount(statistics.viewCount);
    const likes = formatCount(statistics.likeCount || 0);
    const comments = formatCount(statistics.commentCount || 0);

    const thumbnailUrl = snippet.thumbnails?.maxres?.url || snippet.thumbnails?.high?.url;

    const prompt = `You are a YouTube retention expert. Analyze this video's performance data and provide actionable retention improvement advice.

Video Data:
- Title: "${snippet.title}"
- Description: "${snippet.description?.slice(0, 500) || "No description"}"
- Duration: ${duration}
- Views: ${views}
- Likes: ${likes}
- Comments: ${comments}
- Tags: ${snippet.tags?.slice(0, 10).join(", ") || "None"}
- Published: ${snippet.publishedAt?.split("T")[0]}

Return ONLY valid JSON:
{
  "hook_score": number 0-100,
  "estimated_retention": number 20-80,
  "engagement_rate": "low" | "medium" | "high",
  "risk_points": [
    {"timestamp": "approx time like '0:30'", "reason": "why viewers might leave here"},
    {"timestamp": "approx time", "reason": "why viewers might leave here"},
    {"timestamp": "approx time", "reason": "why viewers might leave here"}
  ],
  "hook_analysis": "analysis of the first 30 seconds based on title",
  "improvements": [
    {"area": "Hook", "tip": "specific actionable improvement"},
    {"area": "Pacing", "tip": "specific actionable improvement"},
    {"area": "CTA", "tip": "specific actionable improvement"},
    {"area": "Title Match", "tip": "specific actionable improvement"}
  ],
  "title_thumbnail_match": number 0-100,
  "strengths": ["what this video is doing well", "another strength"],
  "verdict": "overall assessment in one sentence"
}`;

    const raw = await callAI(
      [{ role: "user", content: prompt }],
      { json: true, temperature: 0.4, max_tokens: 1500 }
    );

    const result = safeJsonParse(raw, {});

    await supabase.from("retention_analyses").insert({
      user_id: user.id,
      video_url: videoUrl.trim(),
      video_id: videoId,
      video_title: snippet.title,
      result,
    });

    return NextResponse.json({
      result,
      video: {
        id: videoId,
        title: snippet.title,
        thumbnailUrl,
        duration,
        views,
        likes,
        comments,
      },
    });
  } catch (err) {
    console.error("Retention API error:", err);
    return NextResponse.json({ error: "Failed to analyze video" }, { status: 500 });
  }
}
