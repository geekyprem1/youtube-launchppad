import { RuleSet } from "../../core/scoring";
import { CompetitorFeatures } from "./features";

export const competitorThreatRulesV1: RuleSet = {
  version: "v1.1",
  rules: {
    overlap: {
      weight: 50, // Highest weight because a fast channel in a different niche isn't a threat
      label: "Audience Overlap",
      calculate: (f: CompetitorFeatures) => f.overlapScore
    },
    velocity: {
      weight: 30,
      label: "Growth Velocity",
      calculate: (f: CompetitorFeatures) => f.velocityScore
    },
    momentum: {
      weight: 20,
      label: "Recent Momentum",
      calculate: (f: CompetitorFeatures) => f.momentumScore
    }
  }
};
