import { RawNicheData } from "./data";

export interface RecommendationFeatures {
  demand: number; // 0-100
  competition: number; // 0-100 (inverse: 100 = low competition)
  trend: number; // 0-100
  historicalMatch: number; // 0-100
  audienceMatch: number; // 0-100
  seasonality: number; // 0-100
}

export function extractFeatures(raw: RawNicheData): RecommendationFeatures {
  // Normalize search volume to a 0-100 scale (Assuming 500k is max for this niche)
  const demand = Math.min(100, Math.round((raw.searchVolume / 500000) * 100));
  
  let competition = 50;
  if (raw.competitionLevel === "Low") competition = 100;
  if (raw.competitionLevel === "High") competition = 20;

  // Trend > 1 is positive growth
  const trend = Math.min(100, Math.max(0, Math.round(raw.trendMomentum * 50)));

  const historicalMatch = Math.round(raw.historicalSuccessRate * 100);
  const seasonality = Math.min(100, Math.round(raw.seasonalityMultiplier * 50));

  return {
    demand,
    competition,
    trend,
    historicalMatch,
    audienceMatch: raw.audienceMatchScore,
    seasonality
  };
}
