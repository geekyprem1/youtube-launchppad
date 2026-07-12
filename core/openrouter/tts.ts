import { logAIRequest, logError } from "../logger";

const OPENROUTER_TTS_URL = "https://openrouter.ai/api/v1/audio/speech";

export async function generateSpeech(text: string, voice: string): Promise<Buffer> {
  const model = process.env.OPENROUTER_TTS_MODEL || "hexgrad/kokoro-82m";
  const start = Date.now();

  try {
    const res = await fetch(OPENROUTER_TTS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        input: text,
        voice,
        response_format: "mp3",
      }),
      signal: AbortSignal.timeout(55000),
    });

    if (!res.ok) {
      throw new Error(`OpenRouter TTS error: ${res.status} ${await res.text()}`);
    }

    const arrayBuffer = await res.arrayBuffer();

    logAIRequest({
      model,
      promptVersion: "voice-studio.tts.v1",
      latencyMs: Date.now() - start,
    });

    return Buffer.from(arrayBuffer);
  } catch (err) {
    logError("OpenRouter_TTS", err);
    throw err;
  }
}
