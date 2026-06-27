import { fetchChannelData } from "./data";
import { extractDiagnosticFeatures } from "./features";
import { scoreDiagnostics } from "./scoring";
import { buildDiagnosticPromptV1 } from "./prompts/v1";
import { generateAIResponse } from "../../core/openrouter";
import { validateAIResponse } from "../../core/validation";
import { AuditAnalysisSchema, DiagnosticRequest } from "./types";
import { APIResponse } from "../../types/api";

// Fallback for AI if openrouter fails or validation fails
const FALLBACK_ANALYSIS = {
  priority_queue: [
    {
      issue: "Unable to complete deep AI analysis.",
      why: "The analysis engine timed out or validation failed.",
      impact: "Medium" as "Medium",
      time: "N/A",
      difficulty: "Low" as "Low",
      expected_improvement: "N/A",
      fix: "Review standard channel analytics in YouTube Studio.",
    }
  ],
  upgrade_hook: "Unlock advanced AI diagnostics to get a personalized breakdown.",
};

export async function processDiagnostics(request: DiagnosticRequest): Promise<APIResponse> {
  // 1. Data Layer
  const rawData = await fetchChannelData(request.channelUrl);

  // 2. Feature Extraction
  const features = extractDiagnosticFeatures(rawData);

  // 3. Scoring Engine (Deterministic Math)
  const { growth } = scoreDiagnostics(features);

  const metricsForLLM = {
    growth_score: growth.total,
    ctr_score: features.ctrScore,
    retention_score: features.retentionScore,
    seo_score: features.seoScore,
    consistency_score: features.consistencyScore,
  };

  // 4. AI Reasoning (Prompt Builder -> OpenRouter)
  const prompt = buildDiagnosticPromptV1(request.channelUrl, metricsForLLM);
  const aiRawResponse = await generateAIResponse(
    [{ role: "user", content: prompt }], 
    { json: true, promptVersion: "diagnostics.v1" }
  );

  // 5. Validation Layer
  const analysis = validateAIResponse(aiRawResponse, AuditAnalysisSchema, FALLBACK_ANALYSIS);

  // Map UI specific color formatting for breakdowns
  const breakdownUI = Object.entries(growth.breakdown).map(([k, v]) => ({
    label: v.label,
    value: `${v.value}/100`, // Modified for diagnostics UX
    color: v.impact === "strong" ? "text-green-600" : v.impact === "weak" ? "text-orange-500" : "text-blue-600",
  }));

  // 6. Universal Contract Response
  return {
    version: {
      scoring: "1.0",
      rules: growth.version,
      prompt: "v1.0"
    },
    metrics: {
      growth_score: growth.total,
    },
    breakdown: breakdownUI,
    analysis,
  } as any; 
}
