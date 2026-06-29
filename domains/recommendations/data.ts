import { generateAIResponse } from "../../core/openrouter";
import { validateAIResponse } from "../../core/validation";
import { buildIdeaGenerationPrompt } from "./prompts/v1";
import { RawIdeaArraySchema } from "./types";

export interface RawNicheData {
  searchVolume: number;
  competitionLevel: "Low" | "Medium" | "High";
  trendMomentum: number;
  historicalSuccessRate: number;
  seasonalityMultiplier: number;
  audienceMatchScore: number;
}

export async function fetchNicheData(niche: string, channelId?: string): Promise<RawNicheData> {
  // Mocking data layer for now. In reality this calls YouTube API, Google Trends, etc.
  return {
    searchVolume: 120000,
    competitionLevel: "Medium",
    trendMomentum: 1.2, // 20% growth
    historicalSuccessRate: channelId ? 0.8 : 0.5,
    seasonalityMultiplier: 1.0,
    audienceMatchScore: 85,
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
