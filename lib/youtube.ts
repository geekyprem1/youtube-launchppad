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
    part: "statistics,contentDetails",
    id: videoIds,
  });

  return { playlist, stats };
}

export async function getChannelFromUrl(url: string) {
  const handleMatch = url.match(/@([\w.-]+)/);
  const idMatch = url.match(/channel\/(UC[\w-]+)/);

  if (handleMatch) return getChannelByHandle(handleMatch[1]);
  if (idMatch) return getChannelById(idMatch[1]);
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
