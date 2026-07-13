import { fetchPredictionData } from "./data";
import { extractPredictionFeatures } from "./features";
import { scorePrediction } from "./scoring";
import { buildPredictionPromptV1 } from "./prompts/v1";
import { buildABTestPromptV1 } from "./prompts/ab-v1";
import { generateAIResponse } from "../../core/openrouter";
import { validateAIResponse } from "../../core/validation";
import {
  PredictionAnalysisSchema,
  PredictionRequest,
  ABTestRequest,
  ABTestAnalysisSchema,
  type ABTestAnalysis,
} from "./types";
import { APIResponse } from "../../types/api";

const FALLBACK_ANALYSIS = {
  confidence_reason: "Unable to complete deep AI analysis.",
  strengths: ["Data available"],
  risks: ["Analysis unavailable"],
  improvements: []
};

const FALLBACK_AB: ABTestAnalysis = {
  winner: "tie",
  confidence: 40,
  summary: "Unable to complete full A/B analysis. Try again with clearer titles.",
  why_winner: ["Analysis incomplete"],
  variant_a: {
    label: "Option A",
    score: 50,
    estimated_ctr: "—",
    strengths: [],
    weaknesses: ["Analysis unavailable"],
  },
  variant_b: {
    label: "Option B",
    score: 50,
    estimated_ctr: "—",
    strengths: [],
    weaknesses: ["Analysis unavailable"],
  },
  recommendation: "Re-run the simulator with two distinct options.",
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

/**
 * A/B Test Simulator — compare title or thumbnail concept variants.
 * Gated by `predictor` feature (ViralPredict OTO6).
 */
export async function processABTest(request: ABTestRequest): Promise<{
  version: { prompt: string };
  mode: "title" | "thumbnail";
  analysis: ABTestAnalysis;
}> {
  const mode = request.mode || "title";
  const prompt = buildABTestPromptV1({
    mode,
    topic: request.topic || undefined,
    variantA: request.variant_a,
    variantB: request.variant_b,
  });

  const aiRaw = await generateAIResponse(
    [{ role: "user", content: prompt }],
    { json: true, promptVersion: "prediction.ab.v1", temperature: 0.4, max_tokens: 1500 }
  );

  let analysis = validateAIResponse(aiRaw, ABTestAnalysisSchema, FALLBACK_AB);

  // Soft consistency: if scores disagree with winner label, trust scores
  const scoreA = analysis.variant_a.score;
  const scoreB = analysis.variant_b.score;
  if (Math.abs(scoreA - scoreB) >= 4) {
    const byScore = scoreA > scoreB ? "A" : "B";
    if (analysis.winner !== "tie" && analysis.winner !== byScore) {
      analysis = { ...analysis, winner: byScore };
    }
  } else if (Math.abs(scoreA - scoreB) < 3 && analysis.winner !== "tie") {
    // very close — allow model winner, but cap confidence
    analysis = {
      ...analysis,
      confidence: Math.min(analysis.confidence, 62),
    };
  }

  return {
    version: { prompt: "ab.v1" },
    mode,
    analysis,
  };
}
