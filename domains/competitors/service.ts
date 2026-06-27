import { fetchCompetitorData } from "./data";
import { extractCompetitorFeatures } from "./features";
import { scoreCompetitor } from "./scoring";
import { buildCompetitorPromptV1 } from "./prompts/v1";
import { generateAIResponse } from "../../core/openrouter";
import { validateAIResponse } from "../../core/validation";
import { CompetitorAnalysisSchema, CompetitorRequest } from "./types";
import { APIResponse } from "../../types/api";

const FALLBACK_ANALYSIS = {
  threat_reason: "Unable to complete deep AI analysis on this competitor.",
  opportunity_gaps: [
    {
      gap_type: "Analysis Unavailable",
      description: "We could not reach the LLM provider to extract gap data.",
      action: "Review their channel manually to identify content gaps."
    }
  ]
};

export async function processCompetitor(request: CompetitorRequest): Promise<APIResponse> {
  // 1. Data Layer
  const rawData = await fetchCompetitorData(request.channelUrl);

  // 2. Feature Extraction
  const features = extractCompetitorFeatures(rawData);

  // 3. Scoring Engine (Deterministic Math)
  const { threat, threatLevelString } = scoreCompetitor(features);

  const metricsForLLM = {
    threat_score: threat.total,
    threat_level: threatLevelString,
    velocity_score: features.velocityScore,
    overlap_score: features.overlapScore,
    momentum_score: features.momentumScore,
  };

  // 4. AI Reasoning (Prompt Builder -> OpenRouter)
  const prompt = buildCompetitorPromptV1(request.channelUrl, metricsForLLM);
  const aiRawResponse = await generateAIResponse(
    [{ role: "user", content: prompt }], 
    { json: true, promptVersion: "competitors.v1" }
  );

  // 5. Validation Layer
  const analysis = validateAIResponse(aiRawResponse, CompetitorAnalysisSchema, FALLBACK_ANALYSIS);

  // Format recent viral views nicely
  const formattedViews = rawData.recentViralVideo.views > 1000000 
    ? (rawData.recentViralVideo.views / 1000000).toFixed(1) + "M"
    : rawData.recentViralVideo.views > 1000
      ? (rawData.recentViralVideo.views / 1000).toFixed(1) + "K"
      : rawData.recentViralVideo.views.toString();

  // 6. Universal Contract Response
  return {
    version: {
      scoring: "1.0",
      rules: threat.version,
      prompt: "v1.0"
    },
    metrics: {
      channel_name: rawData.channelName,
      threat_level: threatLevelString,
      recent_viral: {
        title: rawData.recentViralVideo.title,
        views: formattedViews,
        ctr: `${rawData.recentViralVideo.ctr}%`,
        upload_time: rawData.recentViralVideo.uploadTimeStr,
      }
    },
    analysis,
  } as any; 
}
