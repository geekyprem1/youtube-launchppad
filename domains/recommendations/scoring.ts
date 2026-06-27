import { calculateScore, ScoringResult } from "../../core/scoring";
import { RecommendationFeatures } from "./features";
import { opportunityScoreRulesV1 } from "./rules";

export interface RecommendationScores {
  opportunity: ScoringResult;
  confidence: number;
}

export function scoreRecommendation(features: RecommendationFeatures): RecommendationScores {
  const opportunity = calculateScore(features, opportunityScoreRulesV1);
  
  // Calculate confidence deterministically based on data quality (mock logic for now)
  const confidence = Math.round((features.historicalMatch * 0.5) + 50);

  return { opportunity, confidence };
}
