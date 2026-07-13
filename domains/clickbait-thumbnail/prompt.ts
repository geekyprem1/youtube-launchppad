export interface ClickbaitPromptInput {
  videoType: "long" | "shorts";
  topic: string;
  /** Optional ClickBoost template style injection */
  stylePrompt?: string;
  textStyle?: string;
  colors?: string;
}

export function buildClickbaitPromptRequest({
  videoType,
  topic,
  stylePrompt,
  textStyle,
  colors,
}: ClickbaitPromptInput) {
  const layoutInstruction =
    videoType === "long"
      ? "Optimize for a wide 16:9 composition, desktop visibility, large readable elements."
      : "Optimize for a vertical 9:16 composition, mobile-first viewing, one dominant focal subject filling the frame.";

  const styleBlock = stylePrompt
    ? `
    STYLE TEMPLATE (must follow):
    - Visual style: ${stylePrompt}
    - Text style: ${textStyle || "2-4 punchy words"}
    - Color palette: ${colors || "high contrast"}
    `
    : "";

  const systemPrompt = `You are a world-class viral YouTube clickbait thumbnail designer (ClickBoost), in the style of top viral creators. Convert a raw video topic into a MAXIMUM-CTR image generation prompt.

    Layout Goal: ${layoutInstruction}
    ${styleBlock}

    Your prompt must describe:
    - Strong focal subject (face reaction and/or prop as template dictates)
    - High curiosity-gap visual storytelling
    - Bold, oversized, high-contrast text callouts if relevant (short punchy words only, in quotes)
    - Dramatic lighting, high contrast — never plain or subtle
    - Clean composition despite intensity — one clear focal point

    IMPORTANT RULES FOR TEXT: Only include on-image text if it makes sense; keep it to 2-4 punchy words max, enclosed in quotes.
    Keep the prompt under 800 characters. Return ONLY the raw prompt text, no explanations.`;

  const userPromptText = `Video Topic: ${topic}\nGenerate the maximum-CTR clickbait thumbnail prompt now.`;

  return { systemPrompt, userPromptText };
}
