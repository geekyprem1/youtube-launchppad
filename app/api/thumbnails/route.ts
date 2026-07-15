import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { denyUnlessFeature } from "@/lib/requireFeature";
import { callVisionAI } from "@/lib/openrouter";
import { safeJsonParse } from "@/lib/utils";

export const maxDuration = 60;

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

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

async function fileToDataUrl(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const mime = file.type || "image/jpeg";
  return `data:${mime};base64,${buffer.toString("base64")}`;
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const denied = await denyUnlessFeature(user.id, "optimize");
    if (denied) return denied;

    const formData = await req.formData();
    const file = formData.get("image");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Upload a thumbnail image to analyze" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "File must be an image (JPG, PNG, WebP)" }, { status: 400 });
    }

    if (file.size > MAX_IMAGE_BYTES) {
      return NextResponse.json({ error: "Image must be under 5MB" }, { status: 400 });
    }

    const imageDataUrl = await fileToDataUrl(file);

    const visionPrompt = `You are a YouTube thumbnail expert. Analyze this thumbnail image for click-through rate (CTR) potential.

Score and evaluate:
- Overall thumbnail quality (0-100)
- Text readability: Is text clear, big enough, contrast good? (0-100)
- Visual appeal: Colors, composition, focal point (0-100)
- Emotional impact: Does it create curiosity or desire to click? (0-100)
- Color contrast: Do elements stand out? (0-100)

${jsonInstruction}`;

    const raw = await callVisionAI(visionPrompt, imageDataUrl);
    const result = safeJsonParse(raw, {});

    if (!result || Object.keys(result).length === 0) {
      return NextResponse.json(
        { error: "AI returned an empty analysis. Try again." },
        { status: 502 }
      );
    }

    // Save to DB (non-fatal)
    try {
      await supabase.from("thumbnail_analyses").insert({
        user_id: user.id,
        image_url: null,
        description: `upload:${file.name}`,
        result,
      });
    } catch (dbErr) {
      console.error("[Thumbnails] DB save failed (non-fatal):", dbErr);
    }

    return NextResponse.json({ result });
  } catch (err: any) {
    console.error("[Thumbnails] Fatal error:", err.message);
    const message = err?.message || "Failed to analyze thumbnail";
    if (/No endpoints found/i.test(message)) {
      return NextResponse.json(
        {
          error:
            "Vision model unavailable. Set OPENROUTER_VISION_MODEL to google/gemini-2.5-flash and restart the server.",
        },
        { status: 502 }
      );
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
