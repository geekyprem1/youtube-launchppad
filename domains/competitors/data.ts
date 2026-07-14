import { getChannelFromUrl, getChannelVideos } from "../../lib/youtube";

export interface RawCompetitorData {
  channelUrl: string;
  channelName: string;
  channelId: string;
  subscriberCount: number;
  videoCount: number;
  subscriberGrowthRate: number; // estimated monthly % (proxy)
  uploadVelocity: number; // videos per month
  keywordOverlap: number; // niche focus / competitive intensity 0-100
  recentViralVideo: {
    title: string;
    views: number;
    ctr: number;
    uploadTimeStr: string;
    thumbnailUrl?: string;
    videoId?: string;
  };
  recentTitles: string[];
  topTags: string[];
  avgViews: number;
}

type YtVideo = {
  id?: string;
  snippet?: {
    title?: string;
    publishedAt?: string;
    tags?: string[];
    thumbnails?: Record<string, { url?: string }>;
  };
  statistics?: {
    viewCount?: string;
    likeCount?: string;
    commentCount?: string;
  };
};

function relativeTime(date: Date): string {
  const days = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (days < 1) return "today";
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months === 1) return "1 month ago";
  if (months < 12) return `${months} months ago`;
  const years = Math.floor(months / 12);
  return years === 1 ? "1 year ago" : `${years} years ago`;
}

/** Public YT API does not expose CTR — estimate from views vs subscriber base. */
function estimateCtr(views: number, subscriberCount: number): number {
  const ratio = subscriberCount > 0 ? views / subscriberCount : 0.1;
  const ctr = Math.min(18, Math.max(0.8, ratio * 35));
  return Math.round(ctr * 10) / 10;
}

/**
 * Proxy for "keyword / audience overlap" when the user's own channel is unknown.
 * High topic concentration = focused niche competitor = higher competitive intensity.
 */
function computeNicheFocus(titles: string[], tags: string[]): number {
  const stop = new Set([
    "the", "a", "an", "and", "or", "to", "of", "in", "for", "with", "on", "my",
    "i", "you", "your", "this", "that", "is", "how", "what", "why", "vs", "we",
    "are", "be", "at", "from", "by", "not", "it", "as", "do", "if", "so", "up",
  ]);
  const words: string[] = [];
  for (const t of titles) {
    for (const w of t.toLowerCase().replace(/[^\w\s]/g, " ").split(/\s+/)) {
      if (w.length > 2 && !stop.has(w)) words.push(w);
    }
  }
  for (const tag of tags) {
    const t = tag.toLowerCase().trim();
    if (t.length > 2) words.push(t);
  }
  if (words.length === 0) return 50;

  const freq = new Map<string, number>();
  for (const w of words) freq.set(w, (freq.get(w) || 0) + 1);
  const counts = Array.from(freq.values()).sort((a, b) => b - a);
  const topShare = counts.slice(0, 5).reduce((a, b) => a + b, 0) / words.length;
  return Math.min(100, Math.max(25, Math.round(topShare * 140)));
}

export async function fetchCompetitorData(channelUrl: string): Promise<RawCompetitorData> {
  if (!process.env.YOUTUBE_API_KEY) {
    throw new Error("YouTube API key is not configured (YOUTUBE_API_KEY).");
  }

  const channelRes = await getChannelFromUrl(channelUrl);
  const channel = channelRes.items?.[0];
  if (!channel) {
    throw new Error("Channel not found. Use a full URL like https://youtube.com/@handle");
  }

  const channelId = channel.id as string;
  const channelName = (channel.snippet?.title as string) || "Unknown Channel";
  const subscriberCount = parseInt(channel.statistics?.subscriberCount || "0", 10);
  const videoCount = parseInt(channel.statistics?.videoCount || "0", 10);
  const channelPublishedAt = channel.snippet?.publishedAt
    ? new Date(channel.snippet.publishedAt as string)
    : null;

  const uploadsPlaylistId = channel.contentDetails?.relatedPlaylists?.uploads as string | undefined;
  if (!uploadsPlaylistId) {
    throw new Error("No uploads found for this channel.");
  }

  // Pull more uploads for better velocity + viral pick
  const { stats } = await getChannelVideos(uploadsPlaylistId, 15);
  const videos = (stats?.items || []) as YtVideo[];

  if (videos.length === 0) {
    return {
      channelUrl,
      channelName,
      channelId,
      subscriberCount,
      videoCount,
      subscriberGrowthRate: 1,
      uploadVelocity: 0,
      keywordOverlap: 40,
      recentViralVideo: {
        title: "No public videos found",
        views: 0,
        ctr: 1,
        uploadTimeStr: "n/a",
      },
      recentTitles: [],
      topTags: [],
      avgViews: 0,
    };
  }

  // Best recent video by view count
  let best = videos[0];
  let bestViews = 0;
  for (const v of videos) {
    const views = parseInt(v.statistics?.viewCount || "0", 10);
    if (views >= bestViews) {
      bestViews = views;
      best = v;
    }
  }

  // Upload velocity (videos / month) from publish date span
  const dates = videos
    .map((v) => (v.snippet?.publishedAt ? new Date(v.snippet.publishedAt) : null))
    .filter((d): d is Date => d !== null)
    .sort((a, b) => b.getTime() - a.getTime());

  let uploadVelocity = 2;
  if (dates.length >= 2) {
    const spanDays = Math.max(
      1,
      (dates[0].getTime() - dates[dates.length - 1].getTime()) / (1000 * 60 * 60 * 24)
    );
    const videosPerDay = (dates.length - 1) / spanDays;
    uploadVelocity = Math.round(videosPerDay * 30 * 10) / 10;
  } else if (dates.length === 1) {
    uploadVelocity = 1;
  }

  const avgViews =
    videos.reduce((sum, v) => sum + parseInt(v.statistics?.viewCount || "0", 10), 0) /
    videos.length;

  // Estimated monthly sub growth % from recent view performance + channel age
  let subscriberGrowthRate = 2;
  if (subscriberCount > 0) {
    const viewRatioGrowth = (avgViews / subscriberCount) * 25;
    let ageBoost = 0;
    if (channelPublishedAt) {
      const ageMonths = Math.max(
        1,
        (Date.now() - channelPublishedAt.getTime()) / (1000 * 60 * 60 * 24 * 30)
      );
      // Younger channels with solid views grow faster on average
      ageBoost = ageMonths < 12 ? 3 : ageMonths < 36 ? 1 : 0;
    }
    subscriberGrowthRate = Math.min(
      40,
      Math.max(0.5, Math.round((viewRatioGrowth + ageBoost) * 10) / 10)
    );
  }

  const titles = videos.map((v) => v.snippet?.title || "").filter(Boolean);
  const allTags: string[] = [];
  for (const v of videos) {
    if (Array.isArray(v.snippet?.tags)) {
      allTags.push(...v.snippet.tags.slice(0, 8));
    }
  }
  const keywordOverlap = computeNicheFocus(titles, allTags);

  const thumb =
    best.snippet?.thumbnails?.maxres?.url ||
    best.snippet?.thumbnails?.high?.url ||
    best.snippet?.thumbnails?.medium?.url ||
    best.snippet?.thumbnails?.default?.url;

  const published = best.snippet?.publishedAt
    ? new Date(best.snippet.publishedAt)
    : new Date();

  return {
    channelUrl,
    channelName,
    channelId,
    subscriberCount,
    videoCount,
    subscriberGrowthRate,
    uploadVelocity,
    keywordOverlap,
    recentViralVideo: {
      title: best.snippet?.title || "Untitled",
      views: bestViews,
      ctr: estimateCtr(bestViews, subscriberCount),
      uploadTimeStr: relativeTime(published),
      thumbnailUrl: thumb,
      videoId: best.id,
    },
    recentTitles: titles.slice(0, 10),
    topTags: Array.from(new Set(allTags)).slice(0, 15),
    avgViews: Math.round(avgViews),
  };
}
