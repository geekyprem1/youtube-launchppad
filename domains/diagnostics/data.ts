export interface RawChannelData {
  channelUrl: string;
  averageCTR: number; // 0-100%
  averageRetention: number; // 0-100%
  seoOptimizationScore: number; // 0-100
  uploadFrequencyDays: number; // e.g. 7 for weekly
  subscriberCount: number;
  recentViews: number;
}

export async function fetchChannelData(channelUrl: string): Promise<RawChannelData> {
  // Mocking real channel data fetch based on URL
  return {
    channelUrl,
    averageCTR: 4.2, // Below average
    averageRetention: 32.5, // Fair
    seoOptimizationScore: 65, // Needs work
    uploadFrequencyDays: 14, // Inconsistent
    subscriberCount: 15400,
    recentViews: 23000,
  };
}
