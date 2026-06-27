export function logEvent(name: string, payload: any) {
  console.log(`[EVENT] ${name}`, JSON.stringify(payload));
}

export function logError(name: string, error: any) {
  console.error(`[ERROR] ${name}`, error);
}

export function logAIRequest(details: {
  model: string;
  promptVersion: string;
  latencyMs: number;
  tokens?: number;
  cost?: number;
  cacheHit?: boolean;
}) {
  console.log(`[AI_REQUEST]`, JSON.stringify(details));
}
