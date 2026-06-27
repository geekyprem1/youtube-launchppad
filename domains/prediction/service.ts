import { fetchPredictionData } from "./data";
import { extractPredictionFeatures } from "./features";
import { scorePrediction } from "./scoring";
import { buildPredictionPromptV1 } from "./prompts/v1";
import { generateAIResponse } from "../../core/openrouter";
import { validateAIResponse } from "../../core/validation";
import { PredictionAnalysisSchema, PredictionRequest } from "./types";
import { APIResponse } from "../../types/api";

const FALLBACK_ANALYSIS = {
  confidence_reason: "Unable to complete deep AI analysis.",
  strengths: ["Data available"],
  risks: ["Analysis unavailable"],
  improvements: []
};

export async function processPrediction(request: PredictionRequest): Promise<APIResponse> {
  // 1. Data Layer
  const rawData = await fetchPredictionData(request.topic, request.title);

  // 2. Feature Extraction
  const features = extractPredictionFeatures(rawData);

  // 3. Scoring Engine (Deterministic Math)
  const { currentScore, optimizedScore, confidence } = scorePrediction(features);

  const metricsForLLM = {
    current_score: currentScore.total,
    optimized_score: optimizedScore,
    confidence: confidence,
    packaging_score: features.packagingScore,
    demand_score: features.demandScore,
    saturation_score: features.saturationScore,
  };

  // 4. AI Reasoning (Prompt Builder -> OpenRouter)
  const prompt = buildPredictionPromptV1(request.topic, request.title, metricsForLLM);
  const aiRawResponse = await generateAIResponse(
    [{ role: "user", content: prompt }], 
    { json: true, promptVersion: "prediction.v1" }
  );

  // 5. Validation Layer
  const analysis = validateAIResponse(aiRawResponse, PredictionAnalysisSchema, FALLBACK_ANALYSIS);

  // 6. Universal Contract Response
  return {
    version: {
      scoring: "2.0",
      rules: currentScore.version,
      prompt: "v1.0"
    },
    metrics: {
      current_score: currentScore.total,
      optimized_score: optimizedScore,
      confidence: confidence,
      estimated_ctr: `${Math.round(features.packagingScore / 10)}% - ${Math.round(features.packagingScore / 10) + 2}%`,
      estimated_retention: `${Math.round(features.demandScore / 2)}% at 3:00`,
    },
    analysis,
  } as any; 
}
