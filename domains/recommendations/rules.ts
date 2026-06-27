import { RuleSet } from "../../core/scoring";
import { RecommendationFeatures } from "./features";

export const opportunityScoreRulesV1: RuleSet = {
  version: "v1.0",
  rules: {
    demand: {
      weight: 30,
      label: "Demand",
      calculate: (f: RecommendationFeatures) => f.demand
    },
    competition: {
      weight: 20,
      label: "Competition",
      calculate: (f: RecommendationFeatures) => f.competition
    },
    trend: {
      weight: 15,
      label: "Trend Momentum",
      calculate: (f: RecommendationFeatures) => f.trend
    },
    audienceMatch: {
      weight: 15,
      label: "Audience Match",
      calculate: (f: RecommendationFeatures) => f.audienceMatch
    },
    historicalMatch: {
      weight: 10,
      label: "Historical Success",
      calculate: (f: RecommendationFeatures) => f.historicalMatch
    },
    seasonality: {
      weight: 10,
      label: "Seasonality",
      calculate: (f: RecommendationFeatures) => f.seasonality
    }
  }
};
