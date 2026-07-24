const YT = "https://www.googleapis.com/youtube/v3";
const KEY = () => process.env.YOUTUBE_API_KEY!;

async function yt(path: string, params: Record<string, string>) {
  const url = new URL(`${YT}/${path}`);
  url.searchParams.set("key", KEY());
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString(), { next: { revalidate: 300 } });
  if (!res.ok) throw new Error(`YouTube API error: ${res.status}`);
  return res.json();
}

export async function searchVideos(query: string, maxResults = 8) {
  return yt("search", {
    part: "snippet",
    q: query,
    type: "video",
    order: "viewCount",
    maxResults: String(maxResults),
  });
}

export async function getVideoInfo(videoId: string) {
  return yt("videos", {
    part: "snippet,statistics,contentDetails",
    id: videoId,
  });
}

export async function getChannelByHandle(handle: string) {
  return yt("channels", {
    part: "snippet,statistics,contentDetails",
    forHandle: handle,
  });
}

export async function getChannelById(channelId: string) {
  return yt("channels", {
    part: "snippet,statistics,contentDetails",
    id: channelId,
  });
}

export async function getChannelVideos(uploadsPlaylistId: string, maxResults = 10) {
  const playlist = await yt("playlistItems", {
    part: "snippet,contentDetails",
    playlistId: uploadsPlaylistId,
    maxResults: String(maxResults),
  });

  const videoIds = playlist.items
    ?.map((i: { contentDetails: { videoId: string } }) => i.contentDetails.videoId)
    .join(",");

  if (!videoIds) return { playlist, stats: null };

  const stats = await yt("videos", {
    part: "snippet,statistics,contentDetails",
    id: videoIds,
  });

  return { playlist, stats };
}

export async function getChannelByUsername(username: string) {
  return yt("channels", {
    part: "snippet,statistics,contentDetails",
    forUsername: username,
  });
}

async function searchChannelByQuery(query: string) {
  const search = await yt("search", {
    part: "snippet",
    q: query,
    type: "channel",
    maxResults: "1",
  });
  const channelId =
    search.items?.[0]?.id?.channelId || search.items?.[0]?.snippet?.channelId;
  if (!channelId) return null;
  return getChannelById(channelId);
}

/** Normalize paste input: bare @handle, missing protocol, full URL, etc. */
export function normalizeChannelInput(input: string): string {
  const s = input.trim();
  if (!s) return s;
  if (s.startsWith("@")) return `https://www.youtube.com/${s}`;
  if (/^UC[\w-]{20,}$/.test(s)) return `https://www.youtube.com/channel/${s}`;
  if (!/^https?:\/\//i.test(s)) {
    if (s.includes("youtube.com") || s.includes("youtu.be")) {
      return `https://${s.replace(/^\/+/, "")}`;
    }
    return `https://www.youtube.com/@${s.replace(/^@/, "")}`;
  }
  return s;
}

export async function getChannelFromUrl(url: string) {
  const input = normalizeChannelInput(url);

  // Bare or path @handle
  const handleMatch = input.match(/@([\w.-]+)/);
  if (handleMatch) return getChannelByHandle(handleMatch[1]);

  // /channel/UCxxxx
  const idMatch = input.match(/channel\/(UC[\w-]+)/);
  if (idMatch) return getChannelById(idMatch[1]);

  // Legacy /user/username
  const userMatch = input.match(/\/user\/([\w.-]+)/);
  if (userMatch) {
    const byUser = await getChannelByUsername(userMatch[1]);
    if (byUser.items?.length) return byUser;
    const fallback = await searchChannelByQuery(userMatch[1]);
    if (fallback) return fallback;
  }

  // Custom /c/Name or /Name
  const customMatch =
    input.match(/\/c\/([\w.-]+)/) ||
    input.match(/youtube\.com\/([\w.-]+)\/?(?:\?|$)/);
  if (customMatch && !["watch", "shorts", "embed", "playlist", "feed", "results"].includes(customMatch[1])) {
    const found = await searchChannelByQuery(customMatch[1]);
    if (found) return found;
  }

  throw new Error("Could not parse channel URL. Use format: youtube.com/@handle");
}

export function extractVideoId(url: string): string | null {
  const patterns = [
    /[?&]v=([\w-]{11})/,
    /youtu\.be\/([\w-]{11})/,
    /youtube\.com\/embed\/([\w-]{11})/,
    /youtube\.com\/shorts\/([\w-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

export function formatDuration(iso: string): string {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return "0:00";
  const h = parseInt(m[1] || "0");
  const min = parseInt(m[2] || "0");
  const s = parseInt(m[3] || "0");
  if (h > 0) return `${h}:${String(min).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${min}:${String(s).padStart(2, "0")}`;
}

export function formatCount(n: string | number): string {
  const num = typeof n === "string" ? parseInt(n) : n;
  if (isNaN(num)) return "0";
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return String(num);
}

/**
 * Aggregated topic/niche signals derived from live YouTube data.
 * Used by Predictor and Ideas/Recommendations to replace mock metrics.
 * `available: false` means no API key or no usable results — callers should
 * fall back gracefully instead of hard-crashing.
 */
export interface TopicInsights {
  available: boolean;
  sampleSize: number;
  avgViews: number;
  medianViews: number;
  maxViews: number;
  recentVideoCount: number; // among sample, published within last 90 days
  keywordDensity: number; // 0-1, fraction of result titles containing the query terms
  trendMomentum: number; // ratio of newer-half vs older-half avg views (~1 = flat)
}

function median(nums: number[]): number {
  if (nums.length === 0) return 0;
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}

/**
 * Fetches top videos for a query, pulls their real view statistics, and
 * computes demand / competition / trend signals from them.
 */
export async function getTopicInsights(query: string, sample = 12): Promise<TopicInsights> {
  const empty: TopicInsights = {
    available: false,
    sampleSize: 0,
    avgViews: 0,
    medianViews: 0,
    maxViews: 0,
    recentVideoCount: 0,
    keywordDensity: 0,
    trendMomentum: 1,
  };

  if (!process.env.YOUTUBE_API_KEY) return empty;

  try {
    const search = await searchVideos(query, sample);
    const items: Array<{ id?: { videoId?: string } }> = search.items || [];
    const ids = items
      .map((i) => i.id?.videoId)
      .filter((v): v is string => Boolean(v));
    if (ids.length === 0) return empty;

    // videos endpoint accepts comma-separated ids
    const statsRes = await getVideoInfo(ids.join(","));
    const vids: Array<{
      snippet?: { title?: string; publishedAt?: string };
      statistics?: { viewCount?: string };
    }> = statsRes.items || [];
    if (vids.length === 0) return empty;

    const views = vids.map((v) => parseInt(v.statistics?.viewCount || "0", 10));
    const avgViews = Math.round(views.reduce((a, b) => a + b, 0) / views.length);
    const maxViews = Math.max(...views);
    const medViews = median(views);

    const now = Date.now();
    const NINETY_DAYS = 90 * 24 * 60 * 60 * 1000;
    let recentVideoCount = 0;

    // Query keyword density across titles
    const queryWords = query
      .toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2);
    let titlesWithKeyword = 0;

    // Trend: compare newer half vs older half by publish date
    const dated = vids
      .map((v) => ({
        views: parseInt(v.statistics?.viewCount || "0", 10),
        date: v.snippet?.publishedAt ? new Date(v.snippet.publishedAt).getTime() : 0,
        title: (v.snippet?.title || "").toLowerCase(),
      }))
      .filter((d) => d.date > 0)
      .sort((a, b) => b.date - a.date);

    for (const d of dated) {
      if (now - d.date <= NINETY_DAYS) recentVideoCount++;
      if (queryWords.length === 0 || queryWords.some((w) => d.title.includes(w))) {
        titlesWithKeyword++;
      }
    }

    const keywordDensity = dated.length > 0 ? titlesWithKeyword / dated.length : 0;

    let trendMomentum = 1;
    if (dated.length >= 4) {
      const half = Math.floor(dated.length / 2);
      const newer = dated.slice(0, half);
      const older = dated.slice(half);
      const newerAvg = newer.reduce((a, b) => a + b.views, 0) / newer.length;
      const olderAvg = older.reduce((a, b) => a + b.views, 0) / older.length || 1;
      trendMomentum = Math.min(2, Math.max(0.5, newerAvg / olderAvg));
    }

    return {
      available: true,
      sampleSize: vids.length,
      avgViews,
      medianViews: medViews,
      maxViews,
      recentVideoCount,
      keywordDensity: Math.min(1, Math.max(0, keywordDensity)),
      trendMomentum: Math.round(trendMomentum * 100) / 100,
    };
  } catch {
    return empty;
  }
}
