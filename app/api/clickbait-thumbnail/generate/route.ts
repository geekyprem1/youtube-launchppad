import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { callAI } from "@/lib/openrouter";
import { buildClickbaitPromptRequest } from "@/domains/clickbait-thumbnail/prompt";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { videoType, topic } = body;

    if (!videoType || !topic?.trim()) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Step 1: Expand the topic into a maximum-CTR clickbait prompt
    const { systemPrompt, userPromptText } = buildClickbaitPromptRequest({ videoType, topic });

    const startTime = performance.now();

    const clickbaitPrompt = await callAI(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPromptText }
      ],
      { model: "google/gemini-2.5-flash", max_tokens: 500 }
    );

    if (!clickbaitPrompt) throw new Error("Failed to generate clickbait prompt");

    // Step 2: Generate the image using SiliconFlow's higher-tier model
    const imageSize = videoType === "long" ? "1024x576" : "576x1024";
    const apiKey = process.env.SILICONFLOW_API_KEY;
    const imageModel = process.env.SILICONFLOW_PRO_MODEL || process.env.SILICONFLOW_IMAGE_MODEL || "Tongyi-MAI/Z-Image-Turbo";

    if (!apiKey) {
      return NextResponse.json({ error: "SiliconFlow API Key not configured" }, { status: 500 });
    }

    const siliconFlowRes = await fetch("https://api.siliconflow.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        prompt: clickbaitPrompt,
        model: imageModel,
        image_size: imageSize
      })
    });

    const siliconFlowData = await siliconFlowRes.json();

    if (!siliconFlowRes.ok) {
      console.error("SiliconFlow Error:", siliconFlowData);
      throw new Error(siliconFlowData.error?.message || "Failed to generate image");
    }

    const imageUrl = siliconFlowData.images?.[0]?.url;
    const seed = siliconFlowData.images?.[0]?.seed?.toString() || "N/A";

    if (!imageUrl) throw new Error("No image URL returned from SiliconFlow");

    const endTime = performance.now();
    const generationTime = parseFloat(((endTime - startTime) / 1000).toFixed(2));

    // Step 3: Save history
    const { data: savedData, error: dbError } = await supabase
      .from("clickbait_thumbnail_history")
      .insert({
        user_id: user.id,
        video_type: videoType,
        topic: topic,
        clickbait_prompt: clickbaitPrompt,
        image_url: imageUrl,
        model_name: imageModel,
        image_size: imageSize,
        seed: seed,
        generation_time: generationTime
      })
      .select("id")
      .single();

    if (dbError) {
      console.error("Failed to save clickbait thumbnail history:", dbError);
    }

    return NextResponse.json({
      imageUrl,
      clickbaitPrompt,
      model: imageModel,
      imageSize,
      seed,
      generationTime,
      historyId: savedData?.id
    });

  } catch (error: any) {
    console.error("Clickbait Thumbnail API Error:", error);
    return NextResponse.json(
      { error: "Failed to generate clickbait thumbnail", details: error.message },
      { status: 500 }
    );
  }
}
