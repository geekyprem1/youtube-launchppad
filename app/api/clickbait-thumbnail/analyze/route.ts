import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { denyUnlessFeature } from "@/lib/requireFeature";
import { callAI, callVisionAI } from "@/lib/openrouter";
import { extractVideoId, getVideoInfo, formatCount } from "@/lib/youtube";
import { safeJsonParse } from "@/lib/utils";

export const maxDuration = 60;

/**
 * If the user pasted a YouTube watch URL, resolve it to a real thumbnail
 * image URL + optional video metadata for the analyzer.
 */
async function resolveThumbnailInput(
  imageUrl?: string,
  description?: string
): Promise<{ imageUrl?: string; description?: string }> {
  if (!imageUrl) return { imageUrl, description };

  const videoId = extractVideoId(imageUrl);
  if (!videoId) {
    // Direct image URL (cdn, img.youtube.com, data URI, etc.)
    return { imageUrl, description };
  }

  let resolvedImage =
    `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
  let resolvedDesc = description;

  try {
    const ytData = await getVideoInfo(videoId);
    const video = ytData.items?.[0];
    if (video) {
      const thumbs = video.snippet?.thumbnails;
      resolvedImage =
        thumbs?.maxres?.url ||
        thumbs?.standard?.url ||
        thumbs?.high?.url ||
        thumbs?.medium?.url ||
        `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

      const meta = [
        `YouTube video title: "${video.snippet?.title || "Unknown"}"`,
        video.snippet?.channelTitle
          ? `Channel: ${video.snippet.channelTitle}`
          : null,
        video.statistics?.viewCount
          ? `Views: ${formatCount(video.statistics.viewCount)}`
          : null,
      ]
        .filter(Boolean)
        .join(". ");

      resolvedDesc = description?.trim()
        ? `${description.trim()}\n\n${meta}`
        : meta;
    } else {
      resolvedImage = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
    }
  } catch {
    // Public thumbnail CDN still works without API
    resolvedImage = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
  }

  return { imageUrl: resolvedImage, description: resolvedDesc };
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const denied = await denyUnlessFeature(user.id, "clickbait");
    if (denied) return denied;

    const body = await req.json();
    const resolved = await resolveThumbnailInput(
      body.imageUrl?.trim() || undefined,
      body.description?.trim() || undefined
    );
    const imageUrl = resolved.imageUrl;
    const description = resolved.description;

    if (!imageUrl && !description) {
      return NextResponse.json(
        { error: "Provide a YouTube URL, image URL, or description" },
        { status: 400 }
      );
    }

    const jsonInstruction = `Return ONLY valid JSON:
{
  "overall_score": 0-100,
  "text_score": 0-100,
  "visual_score": 0-100,
  "emotion_score": 0-100,
  "contrast_score": 0-100,
  "strengths": ["..."],
  "improvements": [{"point": "...", "fix": "..."}],
  "verdict": "one sentence",
  "ctr_prediction": "low" | "medium" | "high"
}`;

    let raw: string;
    if (imageUrl) {
      const context = description
        ? `\nAdditional context:\n${description}\n`
        : "";
      raw = await callVisionAI(
        `You are a YouTube thumbnail CTR expert (ClickBoost analyzer). Analyze this thumbnail for click-through potential.${context}\n${jsonInstruction}`,
        imageUrl
      );
    } else {
      raw = await callAI(
        [
          {
            role: "user",
            content: `You are a YouTube thumbnail CTR expert. Thumbnail description: "${description}"\n${jsonInstruction}`,
          },
        ],
        { json: true, temperature: 0.3, max_tokens: 1200 }
      );
    }

    const result = safeJsonParse(raw, {});
    if (!result || Object.keys(result).length === 0) {
      return NextResponse.json(
        { error: "AI returned an empty analysis. Try again." },
        { status: 502 }
      );
    }

    return NextResponse.json({ result });
  } catch (err: any) {
    console.error("ClickBoost Analyze Error:", err);
    const message = err?.message || "Failed to analyze thumbnail";
    // Surface model/config issues more clearly
    if (/No endpoints found/i.test(message)) {
      return NextResponse.json(
        {
          error:
            "Vision model unavailable on OpenRouter. Set OPENROUTER_VISION_MODEL to google/gemini-2.5-flash and restart the server.",
        },
        { status: 502 }
      );
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
