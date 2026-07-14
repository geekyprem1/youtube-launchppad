import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { denyUnlessFeature } from "@/lib/requireFeature";
import { callAI } from "@/lib/openrouter";
import { buildClickbaitPromptRequest } from "@/domains/clickbait-thumbnail/prompt";
import { persistRemoteImageSafe } from "@/lib/persistRemoteImage";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const denied = await denyUnlessFeature(user.id, "clickbait");
    if (denied) return denied;

    const body = await req.json();
    const { videoType, topic, templateId, stylePrompt, textStyle, colors } = body;

    if (!videoType || !topic?.trim()) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Optional template pack (ClickBoost)
    let style = stylePrompt as string | undefined;
    let text = textStyle as string | undefined;
    let cols = colors as string | undefined;
    if (templateId && typeof templateId === "string") {
      const { getThumbTemplate } = await import("@/domains/clickbait-thumbnail/templates");
      const t = getThumbTemplate(templateId);
      if (t) {
        style = t.style_prompt;
        text = t.text_style;
        cols = t.colors;
      }
    }

    // Step 1: Expand the topic into a maximum-CTR clickbait prompt
    const { systemPrompt, userPromptText } = buildClickbaitPromptRequest({
      videoType,
      topic,
      stylePrompt: style,
      textStyle: text,
      colors: cols,
    });

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

    const tempImageUrl = siliconFlowData.images?.[0]?.url;
    const seed = siliconFlowData.images?.[0]?.seed?.toString() || "N/A";

    if (!tempImageUrl) throw new Error("No image URL returned from SiliconFlow");

    // Step 3: Re-host on Supabase so history doesn't die when SiliconFlow CDN expires
    const { url: imageUrl, persisted } = await persistRemoteImageSafe(
      supabase,
      user.id,
      tempImageUrl,
      "clickbait"
    );
    if (!persisted) {
      console.warn(
        "[ClickBoost] Image not persisted to storage — history may break when temp URL expires. Run supabase/thumbnail_storage_schema.sql"
      );
    }

    const endTime = performance.now();
    const generationTime = parseFloat(((endTime - startTime) / 1000).toFixed(2));

    // Step 4: Save history with permanent (or best-effort) URL
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
      historyId: savedData?.id,
      imagePersisted: persisted,
    });

  } catch (error: any) {
    console.error("Clickbait Thumbnail API Error:", error);
    return NextResponse.json(
      { error: "Failed to generate clickbait thumbnail", details: error.message },
      { status: 500 }
    );
  }
}
