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
  // In a real scenario, we might use a small fast LLM call here just to brainstorm topics,
  // OR use a database of trending topics. We'll simulate fetching 3 topics.
  return [
    { topic: `How to start with ${niche}`, type: "Tutorial" },
    { topic: `Top 5 mistakes in ${niche}`, type: "Listicle" },
    { topic: `The future of ${niche} in 2026`, type: "News" },
  ];
}
