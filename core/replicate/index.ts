import { logAIRequest, logError } from "../logger";

const REPLICATE_API_URL = "https://api.replicate.com/v1";

export interface ReplicatePrediction {
  id: string;
  status: "starting" | "processing" | "succeeded" | "failed" | "canceled";
  output: unknown;
  error: string | null;
  urls: { get: string; web?: string; cancel?: string };
}

// Model can be "owner/name" (official model, latest version) or
// "owner/name:version_hash" (pinned version) — each uses a different endpoint.
export async function createPrediction(input: Record<string, unknown>): Promise<ReplicatePrediction> {
  const model = process.env.REPLICATE_VIDEO_MODEL;
  if (!model) throw new Error("REPLICATE_VIDEO_MODEL is not configured");

  const token = process.env.REPLICATE_API_TOKEN;
  const start = Date.now();
  const [ownerName, version] = model.split(":");

  const url = version
    ? `${REPLICATE_API_URL}/predictions`
    : `${REPLICATE_API_URL}/models/${ownerName}/predictions`;

  const body = version ? { version, input } : { input };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    logError("Replicate_Create", errText);
    throw new Error(`Replicate error: ${res.status} ${errText}`);
  }

  const prediction = await res.json();

  logAIRequest({
    model,
    promptVersion: "video-creation-pro.v1",
    latencyMs: Date.now() - start,
  });

  return prediction;
}

export async function getPrediction(predictionId: string): Promise<ReplicatePrediction> {
  const token = process.env.REPLICATE_API_TOKEN;

  const res = await fetch(`${REPLICATE_API_URL}/predictions/${predictionId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const errText = await res.text();
    logError("Replicate_Status", errText);
    throw new Error(`Replicate error: ${res.status} ${errText}`);
  }

  return res.json();
}

export function extractVideoUrl(output: unknown): string | null {
  if (typeof output === "string") return output;
  if (Array.isArray(output) && typeof output[0] === "string") return output[0];
  if (output && typeof output === "object" && "video" in (output as Record<string, unknown>)) {
    const video = (output as Record<string, unknown>).video;
    return typeof video === "string" ? video : null;
  }
  return null;
}
