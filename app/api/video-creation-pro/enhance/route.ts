import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { denyUnlessFeature } from "@/lib/requireFeature";
import { callAI } from "@/lib/openrouter";
import { buildVideoPromptRequest } from "@/domains/video-creation-pro/prompt";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const denied = await denyUnlessFeature(user.id, "video_creation_pro");
    if (denied) return denied;

    const body = await req.json();
    const { videoType, topic } = body;

    if (!videoType || !topic?.trim()) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { systemPrompt, userPromptText } = buildVideoPromptRequest({ videoType, topic });

    const enhancedPrompt = await callAI(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPromptText }
      ],
      { model: "google/gemini-2.5-flash", max_tokens: 400 }
    );

    if (!enhancedPrompt) throw new Error("Failed to enhance prompt");

    return NextResponse.json({ enhancedPrompt });

  } catch (error: any) {
    console.error("Video Creation Pro Enhance API Error:", error);
    return NextResponse.json(
      { error: "Failed to enhance prompt", details: error.message },
      { status: 500 }
    );
  }
}
