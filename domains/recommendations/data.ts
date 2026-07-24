import { generateAIResponse } from "../../core/openrouter";
import { validateAIResponse } from "../../core/validation";
import { buildIdeaGenerationPrompt } from "./prompts/v1";
import { RawIdeaArraySchema } from "./types";
import { getTopicInsights } from "../../lib/youtube";

export interface RawNicheData {
  searchVolume: number;
  competitionLevel: "Low" | "Medium" | "High";
  trendMomentum: number;
  historicalSuccessRate: number;
  seasonalityMultiplier: number;
  audienceMatchScore: number;
  dataSource: "youtube" | "fallback";
}

/**
 * Derives real niche signals from live YouTube data (top-video views, recent
 * competition density, view trend). Falls back to conservative defaults when
 * the YouTube API is unavailable so ideas still generate.
 */
export async function fetchNicheData(niche: string, channelId?: string): Promise<RawNicheData> {
  const insights = await getTopicInsights(niche);

  if (!insights.available) {
    return {
      searchVolume: 120000,
      competitionLevel: "Medium",
      trendMomentum: 1.2,
      historicalSuccessRate: channelId ? 0.8 : 0.5,
      seasonalityMultiplier: 1.0,
      audienceMatchScore: 85,
      dataSource: "fallback",
    };
  }

  // Demand proxy: median views of top videos for this niche.
  const searchVolume = insights.medianViews;

  // Competition: share of recent (≤90d) videos among the top results.
  const recentRatio = insights.sampleSize > 0 ? insights.recentVideoCount / insights.sampleSize : 0;
  const competitionLevel: RawNicheData["competitionLevel"] =
    recentRatio > 0.6 ? "High" : recentRatio > 0.3 ? "Medium" : "Low";

  // Real view-trend momentum (newer vs older half of results).
  const trendMomentum = insights.trendMomentum;

  // Audience match derived from keyword coverage in top titles.
  const audienceMatchScore = Math.min(95, Math.max(40, Math.round(insights.keywordDensity * 100)));

  return {
    searchVolume,
    competitionLevel,
    trendMomentum,
    historicalSuccessRate: channelId ? 0.8 : 0.5,
    seasonalityMultiplier: 1.0,
    audienceMatchScore,
    dataSource: "youtube",
  };
}

export async function generateRawIdeas(niche: string): Promise<{ topic: string, type: string }[]> {
  try {
    const prompt = buildIdeaGenerationPrompt(niche);
    const aiRawResponse = await generateAIResponse(
      [{ role: "user", content: prompt }], 
      { json: true, promptVersion: "ideagen.v1" }
    );

    const fallback = {
      ideas: [
        { topic: `How to start with ${niche}`, type: "Tutorial" },
        { topic: `Top 5 mistakes in ${niche}`, type: "Listicle" },
        { topic: `The future of ${niche} in 2026`, type: "News" },
      ]
    };

    const validated = validateAIResponse(aiRawResponse, RawIdeaArraySchema, fallback);
    return validated.ideas;
  } catch (e) {
    console.error("AI Idea Generation Failed, using fallback", e);
    return [
      { topic: `How to start with ${niche}`, type: "Tutorial" },
      { topic: `Top 5 mistakes in ${niche}`, type: "Listicle" },
      { topic: `The future of ${niche} in 2026`, type: "News" },
    ];
  }
}
