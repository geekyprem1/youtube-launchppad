import { calculateScore, ScoringResult } from "../../core/scoring";
import { DiagnosticFeatures } from "./features";
import { growthScoreRulesV1 } from "./rules";

export interface DiagnosticScores {
  growth: ScoringResult;
}

export function scoreDiagnostics(features: DiagnosticFeatures): DiagnosticScores {
  const growth = calculateScore(features, growthScoreRulesV1);
  return { growth };
}
