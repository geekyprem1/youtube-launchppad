import { RawPredictionData } from "./data";

export interface PredictionFeatures {
  packagingScore: number; // 0-100 (Title length & keyword density)
  demandScore: number; // 0-100
  saturationScore: number; // 0-100 (Inverse of competitor volume)
}

export function extractPredictionFeatures(raw: RawPredictionData): PredictionFeatures {
  // Optimal title length is ~50 chars
  let packagingScore = 100;
  if (raw.titleLength > 60 || raw.titleLength < 30) {
    packagingScore -= 20;
  }
  packagingScore = Math.min(100, Math.round(packagingScore * raw.keywordDensity * 1.5));

  // 100k+ search demand = 100
  const demandScore = Math.min(100, Math.round((raw.searchDemand / 100000) * 100));
  
  // > 20 recent competitor videos = saturation
  const saturationScore = Math.max(0, 100 - (raw.competitorVolume * 5));

  return {
    packagingScore,
    demandScore,
    saturationScore
  };
}
