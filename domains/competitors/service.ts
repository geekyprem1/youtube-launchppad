import { fetchCompetitorData } from "./data";
import { extractCompetitorFeatures } from "./features";
import { scoreCompetitor } from "./scoring";
import { buildCompetitorPromptV1 } from "./prompts/v1";
import { generateAIResponse } from "../../core/openrouter";
import { validateAIResponse } from "../../core/validation";
import { CompetitorAnalysisSchema, CompetitorRequest } from "./types";
import { APIResponse } from "../../types/api";
import { formatCount, normalizeChannelInput } from "../../lib/youtube";

const FALLBACK_ANALYSIS = {
  threat_reason: "Unable to complete deep AI analysis on this competitor.",
  opportunity_gaps: [
    {
      gap_type: "Analysis Unavailable",
      description: "We could not reach the LLM provider to extract gap data.",
      action: "Review their channel manually to identify content gaps.",
    },
  ],
};

export async function processCompetitor(request: CompetitorRequest): Promise<APIResponse> {
  const channelUrl = normalizeChannelInput(request.channelUrl);

  // 1. Data Layer — live YouTube Data API
  const rawData = await fetchCompetitorData(channelUrl);

  // 2. Feature Extraction
  const features = extractCompetitorFeatures(rawData);

  // 3. Scoring Engine (Deterministic Math)
  const { threat, threatLevelString } = scoreCompetitor(features);

  const metricsForLLM = {
    threat_score: threat.total,
    threat_level: threatLevelString,
    velocity_score: features.velocityScore,
    overlap_score: features.overlapScore,
    momentum_score: features.momentumScore,
    channel_name: rawData.channelName,
    subscriber_count: rawData.subscriberCount,
    video_count: rawData.videoCount,
    upload_velocity: rawData.uploadVelocity,
    estimated_monthly_growth_pct: rawData.subscriberGrowthRate,
    avg_views: rawData.avgViews,
    niche_focus_score: rawData.keywordOverlap,
    recent_titles: rawData.recentTitles,
    top_tags: rawData.topTags,
    top_video: {
      title: rawData.recentViralVideo.title,
      views: rawData.recentViralVideo.views,
      estimated_ctr: rawData.recentViralVideo.ctr,
    },
  };

  // 4. AI Reasoning (Prompt Builder -> OpenRouter)
  const prompt = buildCompetitorPromptV1(channelUrl, metricsForLLM);
  const aiRawResponse = await generateAIResponse(
    [{ role: "user", content: prompt }],
    { json: true, promptVersion: "competitors.v1" }
  );

  // 5. Validation Layer
  const analysis = validateAIResponse(aiRawResponse, CompetitorAnalysisSchema, FALLBACK_ANALYSIS);

  // 6. Universal Contract Response
  return {
    version: {
      scoring: "1.0",
      rules: threat.version,
      prompt: "v1.0",
    },
    metrics: {
      channel_name: rawData.channelName,
      channel_id: rawData.channelId,
      subscriber_count: formatCount(rawData.subscriberCount),
      video_count: rawData.videoCount,
      threat_level: threatLevelString,
      recent_viral: {
        title: rawData.recentViralVideo.title,
        views: formatCount(rawData.recentViralVideo.views),
        ctr: `${rawData.recentViralVideo.ctr}%`,
        upload_time: rawData.recentViralVideo.uploadTimeStr,
        thumbnail_url: rawData.recentViralVideo.thumbnailUrl || null,
        video_id: rawData.recentViralVideo.videoId || null,
      },
    },
    analysis,
  } as any;
}
