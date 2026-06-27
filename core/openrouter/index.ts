import { logAIRequest, logError } from "../logger";

interface AIRequestOptions {
  json?: boolean;
  temperature?: number;
  max_tokens?: number;
  model?: string;
  promptVersion?: string;
}

export async function generateAIResponse(
  messages: { role: string; content: string }[],
  options: AIRequestOptions = {}
): Promise<string> {
  const model = options.model || "google/gemini-2.5-flash";
  const start = Date.now();

  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.max_tokens ?? 2000,
        response_format: options.json ? { type: "json_object" } : undefined,
      }),
    });

    if (!res.ok) {
      throw new Error(`OpenRouter API error: ${res.status} ${await res.text()}`);
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || "";

    logAIRequest({
      model,
      promptVersion: options.promptVersion || "unknown",
      latencyMs: Date.now() - start,
    });

    return content;
  } catch (err) {
    logError("OpenRouter", err);
    throw err;
  }
}
