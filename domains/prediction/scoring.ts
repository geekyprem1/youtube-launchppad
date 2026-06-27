import { calculateScore, ScoringResult } from "../../core/scoring";
import { PredictionFeatures } from "./features";
import { predictionScoreRulesV2 } from "./rules";

export interface PredictionScores {
  currentScore: ScoringResult;
  optimizedScore: number;
  confidence: number;
}

export function scorePrediction(features: PredictionFeatures): PredictionScores {
  const currentScore = calculateScore(features, predictionScoreRulesV2);
  
  // An optimized score assumes we fix packaging to 100
  const optimizedFeatures = { ...features, packagingScore: 100 };
  const optimized = calculateScore(optimizedFeatures, predictionScoreRulesV2);
  
  // Confidence is driven by demand data reliability
  const confidence = Math.round((features.demandScore * 0.5) + 50);

  return { 
    currentScore, 
    optimizedScore: optimized.total, 
    confidence 
  };
}
