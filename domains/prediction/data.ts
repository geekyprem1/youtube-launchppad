import { getTopicInsights } from "../../lib/youtube";

export interface RawPredictionData {
  titleLength: number;
  keywordDensity: number; // 0-1
  searchDemand: number; // raw volume proxy (median views of top results)
  competitorVolume: number; // recent competing videos (0-24 scale)
  dataSource: "youtube" | "fallback";
}

/**
 * Pulls live YouTube signals for the topic and maps them to prediction inputs.
 * Falls back to conservative defaults if the YouTube API is unavailable so the
 * feature degrades gracefully instead of crashing.
 */
export async function fetchPredictionData(topic: string, title: string): Promise<RawPredictionData> {
  const insights = await getTopicInsights(topic);

  if (!insights.available) {
    return {
      titleLength: title.length,
      keywordDensity: 0.6,
      searchDemand: 45000,
      competitorVolume: 12,
      dataSource: "fallback",
    };
  }

  // Demand proxy: median views of the top-performing videos for this topic.
  const searchDemand = insights.medianViews;

  // Competition proxy: how many recent (≤90d) videos are among the top results,
  // scaled to a 0-24 range so it drives the saturation score across full spread.
  const recentRatio = insights.sampleSize > 0 ? insights.recentVideoCount / insights.sampleSize : 0;
  const competitorVolume = Math.round(recentRatio * 24);

  // Real keyword coverage across top titles (clamped so packaging never zeroes out).
  const keywordDensity = Math.min(1, Math.max(0.3, insights.keywordDensity));

  return {
    titleLength: title.length,
    keywordDensity,
    searchDemand,
    competitorVolume,
    dataSource: "youtube",
  };
}
