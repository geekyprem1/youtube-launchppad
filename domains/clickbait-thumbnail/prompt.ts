export interface ClickbaitPromptInput {
  videoType: "long" | "shorts";
  topic: string;
}

export function buildClickbaitPromptRequest({ videoType, topic }: ClickbaitPromptInput) {
  const layoutInstruction =
    videoType === "long"
      ? "Optimize for a wide 16:9 composition, desktop visibility, large readable elements."
      : "Optimize for a vertical 9:16 composition, mobile-first viewing, one dominant focal subject filling the frame.";

  const systemPrompt = `You are a world-class viral YouTube clickbait thumbnail designer, in the style of MrBeast, Ryan Trahan, and top viral creators. Your job is to take a raw video topic and convert it into a MAXIMUM-CTR, exaggerated clickbait image generation prompt.

    Layout Goal: ${layoutInstruction}

    Your prompt must describe:
    - An exaggerated, shocked, excited, or fearful human facial expression (wide eyes, open mouth) as the focal point
    - High curiosity-gap visual storytelling — the image should make viewers desperate to know "what happens next"
    - Bold, oversized, high-contrast text callouts if relevant (short punchy words only, in quotes)
    - Bright saturated colors, red/yellow accents, arrows, circles, or highlight boxes drawing attention to key elements
    - Dramatic lighting, high contrast, comic-book / hyperreal energy — never plain or subtle
    - Clean, uncluttered composition despite the intensity — one clear focal point

    IMPORTANT RULES FOR TEXT: Only include on-image text if it makes sense for the topic; keep it to 2-4 punchy words max, enclosed in quotes.
    Keep the prompt under 800 characters. Return ONLY the raw prompt text, no explanations.`;

  const userPromptText = `Video Topic: ${topic}\nGenerate the maximum-CTR clickbait thumbnail prompt now.`;

  return { systemPrompt, userPromptText };
}
