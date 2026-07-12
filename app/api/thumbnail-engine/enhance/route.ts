import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { callAI } from "@/lib/openrouter";
import { buildThumbnailPromptRequest } from "@/domains/thumbnail-engine/prompt";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { videoType, inputType, input, category, mood } = body;

    if (!videoType || !inputType || !input || !category || !mood) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { systemPrompt, userPromptText } = buildThumbnailPromptRequest({
      videoType, inputType, input, category, mood,
    });

    const enhancedPrompt = await callAI(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPromptText }
      ],
      { model: "google/gemini-2.5-flash", max_tokens: 500 }
    );

    if (!enhancedPrompt) throw new Error("Failed to enhance prompt");

    return NextResponse.json({ enhancedPrompt });

  } catch (error: any) {
    console.error("Thumbnail Enhance API Error:", error);
    return NextResponse.json(
      { error: "Failed to enhance prompt", details: error.message },
      { status: 500 }
    );
  }
}
