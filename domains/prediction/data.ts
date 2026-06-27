export interface RawPredictionData {
  titleLength: number;
  keywordDensity: number; // 0-1
  searchDemand: number; // raw volume
  competitorVolume: number; // how many recent videos on this
}

export async function fetchPredictionData(topic: string, title: string): Promise<RawPredictionData> {
  // Mock data fetch. In reality, it would analyze YouTube search results for the topic.
  return {
    titleLength: title.length,
    keywordDensity: 0.6,
    searchDemand: 45000,
    competitorVolume: 12,
  };
}
