import { RawCompetitorData } from "./data";

export interface CompetitorFeatures {
  velocityScore: number; // 0-100 (based on upload frequency and growth rate)
  overlapScore: number; // 0-100 (how closely they compete for the same audience)
  momentumScore: number; // 0-100 (recent viral performance)
}

export function extractCompetitorFeatures(raw: RawCompetitorData): CompetitorFeatures {
  // Over 8 uploads/month and >10% growth is max velocity
  const velocityScore = Math.min(100, Math.round(((raw.uploadVelocity / 8) * 50) + ((raw.subscriberGrowthRate / 10) * 50)));
  
  // Overlap is directly mapped
  const overlapScore = Math.min(100, raw.keywordOverlap);
  
  // Momentum driven by recent viral views (assuming 1M views is peak momentum for this tier)
  const momentumScore = Math.min(100, Math.round((raw.recentViralVideo.views / 1000000) * 100));

  return {
    velocityScore,
    overlapScore,
    momentumScore
  };
}
