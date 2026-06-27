import { calculateScore, ScoringResult } from "../../core/scoring";
import { CoachFeatures } from "./features";
import { coachContextRulesV1 } from "./rules";

export interface CoachScores {
  contextScore: ScoringResult;
}

export function scoreCoachContext(features: CoachFeatures): CoachScores {
  const contextScore = calculateScore(features, coachContextRulesV1);
  return { contextScore };
}
