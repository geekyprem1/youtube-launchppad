const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";
const DEFAULT_MODEL = "deepseek/deepseek-v4-flash";

type TextContent = { type: "text"; text: string };
type ImageContent = { type: "image_url"; image_url: { url: string } };
type MessageContent = string | (TextContent | ImageContent)[];

interface Message {
  role: "user" | "assistant" | "system";
  content: MessageContent;
}

interface CallOptions {
  model?: string;
  temperature?: number;
  max_tokens?: number;
  json?: boolean;
}

export async function callAI(
  messages: Message[],
  options: CallOptions = {}
): Promise<string> {
  const body: Record<string, unknown> = {
    model: options.model || DEFAULT_MODEL,
    messages,
    temperature: options.temperature ?? 0.7,
    max_tokens: options.max_tokens ?? 2048,
  };

  if (options.json) {
    body.response_format = { type: "json_object" };
  }

  const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      "X-Title": "YT Launchpad",
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(55000),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenRouter error ${response.status}: ${err}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? "";
}

export async function callVisionAI(
  prompt: string,
  imageUrl: string
): Promise<string> {
  const visionModel =
    process.env.OPENROUTER_VISION_MODEL || "google/gemini-2.0-flash-exp:free";

  return callAI(
    [
      {
        role: "user",
        content: [
          { type: "image_url", image_url: { url: imageUrl } },
          { type: "text", text: prompt },
        ],
      },
    ],
    { model: visionModel, json: true }
  );
}
