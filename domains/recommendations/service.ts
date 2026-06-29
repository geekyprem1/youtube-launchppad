import pLimit from "p-limit";
import { fetchNicheData, generateRawIdeas } from "./data";
import { extractFeatures } from "./features";
import { scoreRecommendation } from "./scoring";
import { buildRecommendationPromptV1 } from "./prompts/v1";
import { generateAIResponse } from "../../core/openrouter";
import { validateAIResponse } from "../../core/validation";
import { IdeaAnalysisSchema, RecommendationRequest } from "./types";
import { APIResponse } from "../../types/api";

// Fallback for AI if openrouter fails or validation fails
const FALLBACK_ANALYSIS = {
  why: "Strong fundamental metrics indicate this topic is highly requested.",
  strengths: ["High search volume", "Low competition"],
  risks: ["Topic might be saturated soon"],
  action_plan: ["Research related keywords", "Create high-retention hook"],
  next_step: "Draft your title and thumbnail",
};

export async function processRecommendations(request: RecommendationRequest): Promise<APIResponse> {
  // 1. Data Layer
  const rawData = await fetchNicheData(request.niche, request.channelId);
  const rawIdeas = await generateRawIdeas(request.niche); // Get basic ideas to score

  // 2. Feature Extraction
  const features = extractFeatures(rawData);
  let ruleVersion = "1.0";

  const limit = pLimit(3);
  const formattedIdeas = await Promise.all(rawIdeas.map((rawIdea, i) => limit(async () => {
    // 3. Scoring Engine (Deterministic Math)
    const { opportunity, confidence } = scoreRecommendation(features);
    ruleVersion = opportunity.version;

    const metricsForLLM = {
      opportunity_score: opportunity.total,
      confidence,
      demand: features.demand,
      competition: features.competition,
      trend: features.trend,
    };

    // 4. AI Reasoning (Prompt Builder -> OpenRouter)
    const prompt = buildRecommendationPromptV1(rawIdea.topic, rawIdea.type, metricsForLLM);
    const aiRawResponse = await generateAIResponse(
      [{ role: "user", content: prompt }], 
      { json: true, promptVersion: "recommendation.v1" }
    );

    // 5. Validation Layer
    const analysis = validateAIResponse(aiRawResponse, IdeaAnalysisSchema, FALLBACK_ANALYSIS);

    // Map UI specific color formatting for breakdowns
    const breakdownUI = Object.entries(opportunity.breakdown).map(([k, v]) => ({
      label: v.label,
      value: `+${v.value}`,
      color: v.impact === "strong" ? "text-green-600" : v.impact === "weak" ? "text-orange-500" : "text-blue-600",
    }));

    // Generate dynamic ROI based on scores
    const reachMin = Math.floor(rawData.searchVolume * (opportunity.total / 100) * 0.2);
    const reachMax = Math.floor(rawData.searchVolume * (opportunity.total / 100) * 0.8);
    const reachText = reachMax > 1000 ? `${Math.round(reachMin/1000)}K - ${Math.round(reachMax/1000)}K` : `${reachMin} - ${reachMax}`;
    
    const subsMin = Math.floor(reachMin * 0.01);
    const subsMax = Math.floor(reachMax * 0.02);

    return {
      id: (i + 1).toString(),
      topic: rawIdea.topic,
      type: rawIdea.type,
      opportunity_score: opportunity.total,
      score_breakdown: breakdownUI,
      roi: {
        reach: reachText,
        subs: `+${subsMin} - ${subsMax}`,
        growth: opportunity.total > 70 ? "High Impact" : "Moderate Impact",
        confidence: confidence,
      },
      analysis
    };
  })));

  // 6. Universal Contract Response
  return {
    version: {
      scoring: "1.0",
      rules: ruleVersion,
      prompt: "v1.0"
    },
    metrics: {}, // Generic metrics at the top level are empty for array responses
    analysis: {},
    ideas: formattedIdeas, // We add ideas at top level or structure it inside metrics? Wait, the APIResponse generic can be extended or we wrap it.
    // We'll return it matching the UI expectations but loosely structured inside the APIResponse.
  } as any; 
}
