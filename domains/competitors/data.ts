export interface RawCompetitorData {
  channelUrl: string;
  channelName: string;
  subscriberGrowthRate: number; // monthly %
  uploadVelocity: number; // videos per month
  keywordOverlap: number; // % overlap with user's channel
  recentViralVideo: {
    title: string;
    views: number;
    ctr: number;
    uploadTimeStr: string;
  };
}

export async function fetchCompetitorData(channelUrl: string): Promise<RawCompetitorData> {
  // Mock data fetch for competitor channel
  return {
    channelUrl,
    channelName: "TechCreator Pro",
    subscriberGrowthRate: 15.5,
    uploadVelocity: 12,
    keywordOverlap: 85,
    recentViralVideo: {
      title: "I built an AI Agent in 10 minutes",
      views: 1200000,
      ctr: 8.4,
      uploadTimeStr: "2 days ago",
    },
  };
}
