export interface ThumbnailPromptInput {
  videoType: "long" | "shorts";
  inputType: "topic" | "title" | "prompt";
  input: string;
  category: string;
  mood: string;
}

export function buildThumbnailPromptRequest({
  videoType,
  inputType,
  input,
  category,
  mood,
}: ThumbnailPromptInput) {
  const layoutInstruction =
    videoType === "long"
      ? "Optimize for a wide 16:9 composition, desktop visibility, large readable elements, and multiple supporting objects for high CTR."
      : "Optimize for a vertical 9:16 composition, mobile-first viewing, one strong focal subject, large object placement, and fast visual impact.";

  const systemPrompt = `You are a world-class YouTube Thumbnail Director. Your job is to take a user's rough idea and convert it into a highly detailed, professional image generation prompt.

    Category: ${category}
    Mood/Style: ${mood}
    Layout Goal: ${layoutInstruction}

    Your prompt must describe a high-CTR composition, strong focal subject, cinematic lighting, high contrast, rich colors, emotional storytelling, background depth, and clean composition.
    IMPORTANT RULES FOR TEXT: If the user explicitly requests specific text to be written in the image, you MUST include that text in your prompt enclosed in quotes (e.g., The bold text "YOUR TEXT HERE" is prominently displayed). If the user does not mention text, do NOT include any random text.
    Keep the prompt under 800 characters. Return ONLY the raw prompt text, no explanations.`;

  const userPromptText = `Input Type: ${inputType}\nInput: ${input}\nGenerate the optimized image prompt now.`;

  return { systemPrompt, userPromptText };
}
