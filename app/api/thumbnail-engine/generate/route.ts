import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { callAI } from "@/lib/openrouter";

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

    // Step 1: Optimize the prompt using Gemini 2.5 Pro
    let layoutInstruction = "";
    if (videoType === "long") {
      layoutInstruction = "Optimize for a wide 16:9 composition, desktop visibility, large readable elements, and multiple supporting objects for high CTR.";
    } else {
      layoutInstruction = "Optimize for a vertical 9:16 composition, mobile-first viewing, one strong focal subject, large object placement, and fast visual impact.";
    }

    const systemPrompt = `You are a world-class YouTube Thumbnail Director. Your job is to take a user's rough idea and convert it into a highly detailed, professional image generation prompt.
    
    Category: ${category}
    Mood/Style: ${mood}
    Layout Goal: ${layoutInstruction}
    
    Your prompt must describe a high-CTR composition, strong focal subject, cinematic lighting, high contrast, rich colors, emotional storytelling, background depth, and clean composition. DO NOT include any text in the image prompt, as text will be added later. Describe the visual scene only.
    Keep the prompt under 800 characters. Return ONLY the raw prompt text, no explanations.`;

    const userPromptText = `Input Type: ${inputType}\nInput: ${input}\nGenerate the optimized image prompt now.`;

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

    const imageUrl = siliconFlowData.images?.[0]?.url;
    const seed = siliconFlowData.images?.[0]?.seed?.toString() || "N/A";

    if (!imageUrl) throw new Error("No image URL returned from SiliconFlow");

    const endTime = performance.now();
    const generationTime = parseFloat(((endTime - startTime) / 1000).toFixed(2));

    // Step 3: Save history
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

    return NextResponse.json({
      imageUrl,
      optimizedPrompt,
      model: imageModel,
      imageSize,
      seed,
      generationTime,
      historyId: savedData?.id
    });

  } catch (error: any) {
    console.error("Thumbnail Engine API Error:", error);
    return NextResponse.json(
      { error: "Failed to generate thumbnail", details: error.message },
      { status: 500 }
    );
  }
}
