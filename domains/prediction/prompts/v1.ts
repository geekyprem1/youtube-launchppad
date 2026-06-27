export function buildPredictionPromptV1(topic: string, title: string, metrics: any) {
  return `You are an elite YouTube Success Predictor. Your job is ONLY to interpret metrics and provide analysis on why a video will succeed or fail.
  
You are NOT responsible for calculating statistics.
You are NOT allowed to invent scores.
You are NOT allowed to fabricate percentages.
You are NOT allowed to estimate metrics.
Only interpret the verified metrics supplied by the backend.

Topic: "${topic}"
Draft Title: "${title}"
Backend Metrics:
${JSON.stringify(metrics, null, 2)}

Analyze this video prediction based on the provided metrics and return ONLY a valid JSON object with the following schema:
{
  "confidence_reason": "One sentence explaining why the algorithm has this level of confidence.",
  "strengths": ["string", "string"],
  "risks": ["string", "string"],
  "improvements": [
    {
      "type": "Title", // Must be "Title", "Hook", "Thumbnail", or "Pacing"
      "old": "The old text if applicable",
      "new": "The new recommended text or concept"
    }
  ]
}`;
}
