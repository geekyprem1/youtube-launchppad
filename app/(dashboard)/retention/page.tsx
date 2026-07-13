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

/** Simple estimated retention polyline from hook + avg + risk markers */
function RetentionCurve({
  avgRetention,
  riskPoints,
  hookScore,
}: {
  avgRetention: number;
  riskPoints: { timestamp: string; reason: string }[];
  hookScore: number;
}) {
  // 0% → 100% of video length as 11 sample points
  const start = Math.min(100, Math.max(70, hookScore + 5));
  const mid = Math.min(start - 5, Math.max(25, avgRetention));
  const end = Math.max(8, Math.round(mid * 0.45));
  const points = [start, start - 4, start - 10, mid + 8, mid, mid - 5, mid - 12, end + 10, end + 4, end, Math.max(5, end - 3)];
  const w = 400;
  const h = 120;
  const pad = 8;
  const coords = points.map((p, i) => {
    const x = pad + (i / (points.length - 1)) * (w - pad * 2);
    const y = pad + (1 - p / 100) * (h - pad * 2);
    return `${x},${y}`;
  });
  const area = `M${coords[0]} L${coords.join(" L")} L${w - pad},${h - pad} L${pad},${h - pad} Z`;

  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-32">
        <defs>
          <linearGradient id="retFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22c55e" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#22c55e" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {/* grid */}
        {[25, 50, 75].map((g) => {
          const y = pad + (1 - g / 100) * (h - pad * 2);
          return (
            <line
              key={g}
              x1={pad}
              x2={w - pad}
              y1={y}
              y2={y}
              stroke="#e5e7eb"
              strokeDasharray="4 4"
            />
          );
        })}
        <path d={area} fill="url(#retFill)" />
        <polyline
          fill="none"
          stroke="#16a34a"
          strokeWidth="2.5"
          points={coords.join(" ")}
        />
        {riskPoints.slice(0, 5).map((rp, i) => {
          // map timestamp like "0:45" or "2:30" roughly along x
          const parts = rp.timestamp.split(":").map(Number);
          const secs =
            parts.length === 2 ? parts[0] * 60 + parts[1] : parts[0] || 0;
          const t = Math.min(0.95, secs / 600); // assume ~10 min scale
          const x = pad + t * (w - pad * 2);
          const yi = Math.min(points.length - 1, Math.floor(t * (points.length - 1)));
          const y = pad + (1 - points[yi] / 100) * (h - pad * 2);
          return (
            <g key={i}>
              <circle cx={x} cy={y} r="5" fill="#f97316" stroke="#fff" strokeWidth="1.5" />
              <title>{`${rp.timestamp}: ${rp.reason}`}</title>
            </g>
          );
        })}
      </svg>
      <div className="flex justify-between text-[10px] text-gray-400 px-1">
        <span>Start (hook)</span>
        <span>Mid</span>
        <span>End</span>
      </div>
      <p className="text-xs text-gray-500">
        Orange dots = predicted drop-off risks. Curve is estimated from public
        metrics + AI (not official YouTube Analytics).
      </p>
    </div>
  );
}

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
      <Header
        title="WatchTime MAX"
        subtitle="Retention curve · drop-off risks · AI tips to hold viewers longer"
      />
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
              {/* Drop-off timeline viz */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <h3 className="font-semibold text-sm text-gray-900 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-orange-500" /> Estimated retention curve
                  </h3>
                </CardHeader>
                <CardBody>
                  <RetentionCurve
                    avgRetention={result.estimated_retention}
                    riskPoints={result.risk_points || []}
                    hookScore={result.hook_score}
                  />
                </CardBody>
              </Card>

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
