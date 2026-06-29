"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { scoreBg, scoreBarColor } from "@/lib/utils";
import { TrendingUp, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import Image from "next/image";

interface VideoInfo {
  id: string;
  title: string;
  thumbnailUrl: string;
  duration: string;
  views: string;
  likes: string;
  comments: string;
}

interface RetentionResult {
  hook_score: number;
  estimated_retention: number;
  engagement_rate: string;
  risk_points: { timestamp: string; reason: string }[];
  hook_analysis: string;
  improvements: { area: string; tip: string }[];
  title_thumbnail_match: number;
  strengths: string[];
  verdict: string;
}

const engagementColors: Record<string, "green" | "yellow" | "red"> = {
  high: "green",
  medium: "yellow",
  low: "red",
};

export default function RetentionPage() {
  const [videoUrl, setVideoUrl] = useState("");
  const [result, setResult] = useState<RetentionResult | null>(null);
  const [video, setVideo] = useState<VideoInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const url = params.get("url");
    if (url) {
      setVideoUrl(url);
      analyze(url);
    }
  }, []);

  async function analyze(overrideUrl?: string) {
    const targetUrl = typeof overrideUrl === "string" ? overrideUrl : videoUrl;
    if (!targetUrl.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    setVideo(null);
    try {
      const res = await fetch("/api/retention", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoUrl: targetUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data.result);
      setVideo(data.video);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to analyze video");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Header title="Retention Analyzer" subtitle="Find out why viewers drop off and how to fix it" />
      <div className="p-6 max-w-4xl mx-auto space-y-6">

        <Card>
          <CardBody>
            <div className="flex gap-3">
              <Input
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="Paste any YouTube video URL — e.g. https://youtube.com/watch?v=..."
                onKeyDown={(e) => e.key === "Enter" && analyze()}
                className="flex-1"
              />
              <Button onClick={() => analyze()} loading={loading} disabled={!videoUrl.trim()}>
                Analyze
              </Button>
            </div>
            {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
          </CardBody>
        </Card>

        {loading && (
          <div className="space-y-4">
            <div className="h-32 bg-white rounded-xl border border-gray-200 animate-pulse" />
            <div className="h-64 bg-white rounded-xl border border-gray-200 animate-pulse" />
          </div>
        )}

        {video && result && !loading && (
          <div className="space-y-4">
            {/* Video Preview */}
            <Card>
              <CardBody>
                <div className="flex gap-4 items-start">
                  {video.thumbnailUrl && (
                    <Image
                      src={video.thumbnailUrl}
                      alt={video.title}
                      width={160}
                      height={90}
                      className="rounded-lg object-cover flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 mb-2 leading-snug">{video.title}</h3>
                    <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {video.duration}
                      </span>
                      <span>👁 {video.views} views</span>
                      <span>👍 {video.likes} likes</span>
                      <span>💬 {video.comments} comments</span>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Scores */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card>
                <CardBody className="flex flex-col items-center gap-3">
                  <p className="text-xs font-medium text-gray-500">Hook Score</p>
                  <ScoreRing score={result.hook_score} size={80} />
                  <p className="text-xs text-gray-600 text-center">{result.hook_analysis}</p>
                </CardBody>
              </Card>

              <Card>
                <CardBody className="flex flex-col items-center gap-3">
                  <p className="text-xs font-medium text-gray-500">Est. Avg Retention</p>
                  <div className="text-4xl font-bold text-gray-900">{result.estimated_retention}%</div>
                  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${scoreBarColor(result.estimated_retention)}`}
                      style={{ width: `${result.estimated_retention}%` }}
                    />
                  </div>
                  <Badge variant={engagementColors[result.engagement_rate] || "default"}>
                    {result.engagement_rate} engagement
                  </Badge>
                </CardBody>
              </Card>

              <Card>
                <CardBody className="flex flex-col items-center gap-3">
                  <p className="text-xs font-medium text-gray-500">Title ↔ Content Match</p>
                  <ScoreRing score={result.title_thumbnail_match} size={80} />
                  <p className="text-xs text-gray-500 text-center">
                    {result.title_thumbnail_match >= 75
                      ? "Great match — reduces early drop-off"
                      : "Mismatch may cause viewers to leave early"}
                  </p>
                </CardBody>
              </Card>
            </div>

            {/* Verdict */}
            <Card>
              <CardBody>
                <p className="text-sm text-gray-700 italic">"{result.verdict}"</p>
              </CardBody>
            </Card>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Risk Points */}
              <Card>
                <CardHeader>
                  <h3 className="font-semibold text-sm text-gray-900 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-500" /> Drop-Off Risk Points
                  </h3>
                </CardHeader>
                <CardBody className="space-y-3">
                  {result.risk_points?.map((rp, i) => (
                    <div key={i} className="flex gap-3 p-2.5 bg-orange-50 rounded-lg">
                      <span className="text-xs font-mono font-bold text-orange-600 flex-shrink-0 mt-0.5">
                        {rp.timestamp}
                      </span>
                      <p className="text-xs text-gray-700">{rp.reason}</p>
                    </div>
                  ))}
                </CardBody>
              </Card>

              {/* Strengths */}
              <Card>
                <CardHeader>
                  <h3 className="font-semibold text-sm text-gray-900 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" /> What's Working
                  </h3>
                </CardHeader>
                <CardBody className="space-y-2">
                  {result.strengths?.map((s, i) => (
                    <div key={i} className="flex gap-2 text-xs text-gray-600">
                      <span className="text-green-500 mt-0.5">✓</span>{s}
                    </div>
                  ))}
                </CardBody>
              </Card>

              {/* Improvements */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <h3 className="font-semibold text-sm text-gray-900 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-500" /> Improvement Plan
                  </h3>
                </CardHeader>
                <CardBody>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {result.improvements?.map((imp, i) => (
                      <div key={i} className="p-3 border border-blue-100 bg-blue-50 rounded-lg">
                        <p className="text-xs font-semibold text-blue-700 mb-1">{imp.area}</p>
                        <p className="text-xs text-gray-700">{imp.tip}</p>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>
        )}

        {!loading && !result && (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Paste any YouTube video URL</h3>
            <p className="text-gray-500 text-sm max-w-sm mx-auto">
              We'll analyze the video using public data and give you AI-powered retention improvement tips.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
