import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { callAI } from "@/lib/openrouter";
import { denyUnlessFeature } from "@/lib/requireFeature";
import { getCreditState, creditGate, spendCredits, CREDIT_COST } from "@/lib/credits";
import { buildThumbnailPromptRequest } from "@/domains/thumbnail-engine/prompt";
import { persistRemoteImageSafe } from "@/lib/persistRemoteImage";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const denied = await denyUnlessFeature(user.id, "thumbnail_basic");
    if (denied) return denied;

    const body = await req.json();
    const { videoType, inputType, input, category, mood } = body;

    if (!videoType || !inputType || !input || !category || !mood) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const creditState = await getCreditState(user.id);
    const gate = creditGate(creditState, CREDIT_COST.thumbnail);
    if (!gate.ok) {
      return NextResponse.json({ error: gate.error }, { status: gate.status });
    }

    // Step 1: Optimize the prompt using Gemini 2.5 Pro
    const { systemPrompt, userPromptText } = buildThumbnailPromptRequest({
      videoType, inputType, input, category, mood,
    });

    const startTime = performance.now();

    const optimizedPrompt = await callAI(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPromptText }
      ],
      { model: "google/gemini-2.5-flash", max_tokens: 500 }
    );

    if (!optimizedPrompt) throw new Error("Failed to optimize prompt");

    // Step 2: Generate the image using SiliconFlow API
    const imageSize = videoType === "long" ? "1024x576" : "576x1024";
    const apiKey = process.env.SILICONFLOW_API_KEY;
    const imageModel = process.env.SILICONFLOW_IMAGE_MODEL || "Tongyi-MAI/Z-Image-Turbo";

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
        prompt: optimizedPrompt,
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

    // Step 3: Re-host on Supabase (SiliconFlow URLs expire)
    const { url: imageUrl, persisted } = await persistRemoteImageSafe(
      supabase,
      user.id,
      tempImageUrl,
      "thumbnail-engine"
    );
    if (!persisted) {
      console.warn(
        "[ThumbnailEngine] Image not persisted — run supabase/thumbnail_storage_schema.sql"
      );
    }

    const endTime = performance.now();
    const generationTime = parseFloat(((endTime - startTime) / 1000).toFixed(2));

    // Step 4: Save history
    const { data: savedData, error: dbError } = await supabase
      .from("thumbnail_engine_history")
      .insert({
        user_id: user.id,
        video_type: videoType,
        input_type: inputType,
        user_input: input,
        category: category,
        mood: mood,
        optimized_prompt: optimizedPrompt,
        image_url: imageUrl,
        model_name: imageModel,
        image_size: imageSize,
        seed: seed,
        generation_time: generationTime
      })
      .select("id")
      .single();

    if (dbError) {
      console.error("Failed to save thumbnail history:", dbError);
    }

    await spendCredits(user.id, CREDIT_COST.thumbnail, creditState);

    return NextResponse.json({
      imageUrl,
      optimizedPrompt,
      model: imageModel,
      imageSize,
      seed,
      generationTime,
      historyId: savedData?.id,
      imagePersisted: persisted,
    });

  } catch (error: any) {
    console.error("Thumbnail Engine API Error:", error);
    return NextResponse.json(
      { error: "Failed to generate thumbnail", details: error.message },
      { status: 500 }
    );
  }
}
