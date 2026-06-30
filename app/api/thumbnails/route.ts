import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { callAI, callVisionAI } from "@/lib/openrouter";
import { safeJsonParse } from "@/lib/utils";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { imageUrl, description } = await req.json();

    if (!imageUrl && !description) {
      return NextResponse.json({ error: "Provide an image URL or description" }, { status: 400 });
    }

    let raw: string;

    const jsonInstruction = `Return ONLY valid JSON (no markdown, no code fences):
{
  "overall_score": number 0-100,
  "text_score": number 0-100,
  "visual_score": number 0-100,
  "emotion_score": number 0-100,
  "contrast_score": number 0-100,
  "strengths": ["strength1", "strength2"],
  "improvements": [
    {"point": "specific issue", "fix": "how to fix it"},
    {"point": "specific issue", "fix": "how to fix it"},
    {"point": "specific issue", "fix": "how to fix it"}
  ],
  "verdict": "one sentence summary",
  "ctr_prediction": "low" | "medium" | "high"
}`;

    if (imageUrl) {
      const visionPrompt = `You are a YouTube thumbnail expert. Analyze this thumbnail image for click-through rate (CTR) potential.

Score and evaluate:
- Overall thumbnail quality (0-100)
- Text readability: Is text clear, big enough, contrast good? (0-100)
- Visual appeal: Colors, composition, focal point (0-100)
- Emotional impact: Does it create curiosity or desire to click? (0-100)
- Color contrast: Do elements stand out? (0-100)

${jsonInstruction}`;

      raw = await callVisionAI(visionPrompt, imageUrl);
    } else {
      const textPrompt = `You are a YouTube thumbnail expert. A creator has described their thumbnail: "${description}"

Analyze this thumbnail description for click-through rate (CTR) potential based on YouTube best practices.

${jsonInstruction}`;

      raw = await callAI(
        [{ role: "user", content: textPrompt }],
        { json: true, temperature: 0.4 }
      );
    }

    const result = safeJsonParse(raw, {});

    // Save to DB (non-fatal)
    try {
      await supabase.from("thumbnail_analyses").insert({
        user_id: user.id,
        image_url: imageUrl || null,
        description: description || null,
        result,
      });
    } catch (dbErr) {
      console.error("[Thumbnails] DB save failed (non-fatal):", dbErr);
    }

    return NextResponse.json({ result });
  } catch (err: any) {
    console.error("[Thumbnails] Fatal error:", err.message);
    return NextResponse.json({ error: "Failed to analyze thumbnail", details: err.message }, { status: 500 });
  }
}
