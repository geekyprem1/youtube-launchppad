export interface VideoPromptInput {
  videoType: "long" | "shorts";
  topic: string;
}

export function buildVideoPromptRequest({ videoType, topic }: VideoPromptInput) {
  const layoutInstruction =
    videoType === "long"
      ? "Describe a cinematic widescreen (16:9) scene."
      : "Describe a vertical, mobile-first (9:16) scene with one dominant subject filling the frame.";

  const systemPrompt = `You are a professional AI video director. Convert a rough topic into a single, highly detailed text-to-video generation prompt.

    Layout Goal: ${layoutInstruction}

    Your prompt must describe: the subject and its action/motion, camera movement (e.g. slow pan, dolly in, static shot, handheld), setting and environment, lighting and mood, and visual style (cinematic realism unless the topic implies otherwise). Be concrete and visual — describe what should be SEEN and how it MOVES, not abstract ideas.
    Keep the prompt under 500 characters. Return ONLY the raw prompt text, no explanations.`;

  const userPromptText = `Topic: ${topic}\nGenerate the detailed video generation prompt now.`;

  return { systemPrompt, userPromptText };
}
