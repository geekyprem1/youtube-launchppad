import { VideoType } from "./types";
import type { TopicInsights } from "../../lib/youtube";

// ─── Scoring Engine ───────────────────────────────────────────────────────────
// All scoring is deterministic math — no AI needed for these values.

interface ScoringFeatures {
  demand: number;       // 0–100
  competition: number;  // 0–100 (lower = less competition)
  trend: number;        // 0–100
  channelFit: number;   // 0–100 (1 if no channel data)
}

export interface ScoreResult {
  confidence: number;    // 0–100
  difficulty: "Easy" | "Medium" | "Hard";
  opportunity: number;   // 0–100 composite
}

/**
 * Calculates a deterministic confidence + difficulty score.
 * Weights: demand 35%, trend 25%, competition gap 25%, channel fit 15%.
 */
export function scoreTopicOpportunity(features: ScoringFeatures): ScoreResult {
  const competitionGap = 100 - features.competition; // higher = less competition

  const confidence = Math.round(
    features.demand * 0.35 +
    features.trend * 0.25 +
    competitionGap * 0.25 +
    features.channelFit * 0.15
  );

  const difficulty: ScoreResult["difficulty"] =
    competitionGap > 70 ? "Easy" : competitionGap > 40 ? "Medium" : "Hard";

  const opportunity = Math.round(
    (confidence * 0.6) + (competitionGap * 0.4)
  );

  return {
    confidence: Math.min(100, Math.max(0, confidence)),
    difficulty,
    opportunity: Math.min(100, Math.max(0, opportunity)),
  };
}

/**
 * Assigns a hook confidence score based on hook type baseline.
 * Deterministic: variance is derived from the hook text hash (not random),
 * so the same hook always yields the same score across calls and cache hits.
 */
export function scoreHookConfidence(
  hookType: "Curiosity" | "Story" | "Shocking Fact" | "Question" | "FOMO",
  topicDemand: number,
  hookText = ""
): number {
  const baselines: Record<typeof hookType, number> = {
    "Curiosity": 82,
    "FOMO": 85,
    "Shocking Fact": 88,
    "Question": 78,
    "Story": 75,
  };
  const base = baselines[hookType];
  const demandBonus = Math.round(topicDemand * 0.1);
  // Deterministic ±5 variance from a stable hash of the hook text.
  const hash = hookText.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const variance = (hash % 11) - 5;
  return Math.min(99, Math.max(60, base + demandBonus + variance));
}

/**
 * Returns the max_tokens budget for script generation based on video type.
 */
export function getScriptTokenBudget(videoType: VideoType): number {
  const budgets: Record<VideoType, number> = {
    shorts: 800,
    news: 2000,
    tutorial: 3000,
    listicle: 3000,
    faceless: 3000,
    long_form: 4000,
    storytelling: 4000,
    podcast: 4500,
    documentary: 5000,
  };
  return budgets[videoType] ?? 3000;
}

/**
 * Derives a human-readable duration label from word count + video type.
 */
export function getDurationLabel(wordCount: number, videoType: VideoType): string {
  if (videoType === "shorts") return wordCount < 90 ? "30 sec" : "60 sec";
  if (wordCount < 300) return "3 min";
  if (wordCount < 800) return "8 min";
  return "10+ min";
}

/**
 * Fallback niche features when no real data source is available.
 * Deterministic pseudo-random based on niche string hash (labelled as estimate).
 */
export function simulateNicheFeatures(niche: string): ScoringFeatures {
  // Deterministic pseudo-random based on niche string hash
  const hash = niche.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return {
    demand: 50 + (hash % 40),
    competition: 20 + (hash % 50),
    trend: 40 + (hash % 50),
    channelFit: 70,
  };
}

/**
 * Maps live YouTube topic signals into scoring features (real data path).
 * - demand: median views of top results (200k views ≈ 100)
 * - competition: share of recent (≤90d) videos among top results
 * - trend: view momentum (newer vs older half; ~1.0 momentum ≈ 50)
 */
export function nicheFeaturesFromInsights(insights: TopicInsights): ScoringFeatures {
  const demand = Math.min(100, Math.max(0, Math.round((insights.medianViews / 200000) * 100)));
  const recentRatio = insights.sampleSize > 0 ? insights.recentVideoCount / insights.sampleSize : 0;
  const competition = Math.min(100, Math.max(0, Math.round(recentRatio * 100)));
  const trend = Math.min(100, Math.max(0, Math.round(50 * insights.trendMomentum)));
  return { demand, competition, trend, channelFit: 70 };
}
