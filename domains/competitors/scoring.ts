import { calculateScore, ScoringResult } from "../../core/scoring";
import { CompetitorFeatures } from "./features";
import { competitorThreatRulesV1 } from "./rules";

export interface CompetitorScores {
  threat: ScoringResult;
  threatLevelString: "Critical" | "High" | "Medium" | "Low";
}

export function scoreCompetitor(features: CompetitorFeatures): CompetitorScores {
  const threat = calculateScore(features, competitorThreatRulesV1);
  
  let threatLevelString: "Critical" | "High" | "Medium" | "Low" = "Low";
  if (threat.total >= 85) threatLevelString = "Critical";
  else if (threat.total >= 70) threatLevelString = "High";
  else if (threat.total >= 50) threatLevelString = "Medium";

  return { 
    threat,
    threatLevelString
  };
}
