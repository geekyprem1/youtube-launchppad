import { RuleSet } from "../../core/scoring";
import { PredictionFeatures } from "./features";

export const predictionScoreRulesV2: RuleSet = {
  version: "v2.0",
  rules: {
    packaging: {
      weight: 40,
      label: "Packaging Quality",
      calculate: (f: PredictionFeatures) => f.packagingScore
    },
    demand: {
      weight: 30,
      label: "Search Demand",
      calculate: (f: PredictionFeatures) => f.demandScore
    },
    saturation: {
      weight: 30,
      label: "Topic Opportunity",
      calculate: (f: PredictionFeatures) => f.saturationScore
    }
  }
};
