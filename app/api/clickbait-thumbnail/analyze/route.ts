import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { denyUnlessFeature } from "@/lib/requireFeature";
import { callAI, callVisionAI } from "@/lib/openrouter";
import { safeJsonParse } from "@/lib/utils";

export const maxDuration = 60;

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

    const { imageUrl, description } = await req.json();
    if (!imageUrl && !description) {
      return NextResponse.json(
        { error: "Provide an image URL or description" },
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
      raw = await callVisionAI(
        `You are a YouTube thumbnail CTR expert (ClickBoost analyzer). Analyze this thumbnail.\n${jsonInstruction}`,
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
    return NextResponse.json({ result });
  } catch (err: any) {
    console.error("ClickBoost Analyze Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to analyze thumbnail" },
      { status: 500 }
    );
  }
}
