import { VideoType } from "./types";

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
 * Each type has a natural baseline; random variance ±10 is added.
 */
export function scoreHookConfidence(
  hookType: "Curiosity" | "Story" | "Shocking Fact" | "Question" | "FOMO",
  topicDemand: number
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
  const variance = Math.floor(Math.random() * 11) - 5;
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
 * Simulates niche features when no real data source is available.
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
