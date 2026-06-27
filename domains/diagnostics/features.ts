import { RawChannelData } from "./data";

export interface DiagnosticFeatures {
  ctrScore: number; // 0-100
  retentionScore: number; // 0-100
  seoScore: number; // 0-100
  consistencyScore: number; // 0-100
}

export function extractDiagnosticFeatures(raw: RawChannelData): DiagnosticFeatures {
  // Map CTR (assuming 10% is perfect)
  const ctrScore = Math.min(100, Math.round((raw.averageCTR / 10) * 100));
  
  // Map Retention (assuming 60% is perfect)
  const retentionScore = Math.min(100, Math.round((raw.averageRetention / 60) * 100));
  
  // SEO is already 0-100
  const seoScore = raw.seoOptimizationScore;
  
  // Map Consistency (7 days is perfect, more than 30 is bad)
  let consistencyScore = 100;
  if (raw.uploadFrequencyDays > 7) {
    consistencyScore = Math.max(0, 100 - ((raw.uploadFrequencyDays - 7) * 4));
  }
  
  return {
    ctrScore,
    retentionScore,
    seoScore,
    consistencyScore,
  };
}
