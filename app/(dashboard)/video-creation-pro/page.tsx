"use client";

import { useEffect, useRef, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Clapperboard, PlaySquare, Smartphone, Loader2, Sparkles, Download, RefreshCw } from "lucide-react";

interface HistoryItem {
  id: string;
  videoType: "long" | "shorts";
  topic: string;
  status: string;
  videoUrl: string | null;
  createdAt: string;
}

const POLL_INTERVAL_MS = 4000;

function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export default function VideoCreationProPage() {
  const [videoType, setVideoType] = useState<"long" | "shorts">("long");
  const [prompt, setPrompt] = useState("");
  const [enhancing, setEnhancing] = useState(false);

  const [generating, setGenerating] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [statusText, setStatusText] = useState("");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState("");

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  useEffect(() => {
    try {
      const prefill = sessionStorage.getItem("faceless_video_prompt");
      if (prefill) {
        setPrompt(prefill);
        sessionStorage.removeItem("faceless_video_prompt");
      }
    } catch {
      // ignore
    }
  }, []);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadHistory = async () => {
    try {
      const res = await fetch("/api/video-creation-pro/history");
      const data = await res.json();
      if (res.ok) {
        setHistory(
          (data.data || []).map((row: any) => ({
            id: row.id,
            videoType: row.video_type,
            topic: row.topic,
            status: row.status,
            videoUrl: row.video_url,
            createdAt: row.created_at,
          }))
        );
      }
    } catch {
      // history is a nice-to-have; ignore failures silently
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
    return () => stopPolling();
  }, []);

  const stopPolling = () => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    pollRef.current = null;
    timerRef.current = null;
  };

  const handleEnhance = async () => {
    if (!prompt.trim() || enhancing) return;

    setEnhancing(true);
    setError("");

    try {
      const res = await fetch("/api/video-creation-pro/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoType, topic: prompt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Enhance failed");
      setPrompt(data.enhancedPrompt);
    } catch (err: any) {
      setError(err.message || "Failed to enhance prompt");
    } finally {
      setEnhancing(false);
    }
  };

  const pollStatus = (predictionId: string) => {
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/video-creation-pro/status/${predictionId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Status check failed");

        if (data.status === "succeeded") {
          setVideoUrl(data.videoUrl);
          setGenerating(false);
          stopPolling();
          loadHistory();
        } else if (data.status === "failed" || data.status === "canceled") {
          setError(data.error || "Video generation failed");
          setGenerating(false);
          stopPolling();
        } else {
          setStatusText(data.status === "processing" ? "Rendering video..." : "Starting up...");
        }
      } catch (err: any) {
        setError(err.message || "Status check failed");
        setGenerating(false);
        stopPolling();
      }
    }, POLL_INTERVAL_MS);
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || generating) return;

    setGenerating(true);
    setVideoUrl(null);
    setError("");
    setElapsed(0);
    setStatusText("Starting up...");

    timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);

    try {
      const res = await fetch("/api/video-creation-pro/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoType, prompt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to start generation");

      pollStatus(data.predictionId);
    } catch (err: any) {
      setError(err.message || "Failed to start video generation");
      setGenerating(false);
      stopPolling();
    }
  };

  const handleDownload = async (url: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const objUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objUrl;
      a.download = `video-${Date.now()}.mp4`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(objUrl);
    } catch {
      window.open(url, "_blank");
    }
  };

  return (
    <>
      <Header
        title="Video Creation Engine Pro"
        subtitle="Turn a prompt or topic into an AI-generated video."
      />

      <div className="p-4 md:p-8 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        {/* Input Panel */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-semibold text-gray-900">Prompt or Topic</label>
                <button
                  type="button"
                  onClick={handleEnhance}
                  disabled={!prompt.trim() || enhancing || generating}
                  className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {enhancing ? "Enhancing..." : "Enhance Prompt"}
                </button>
              </div>
              <div className="relative">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  disabled={enhancing}
                  placeholder="E.g., A drone shot flying over a neon-lit cyberpunk city at night"
                  className="w-full h-32 px-4 py-3 bg-gray-50 border border-gray-200 focus:border-blue-500 focus:bg-white rounded-xl text-sm transition-all outline-none resize-none disabled:opacity-70"
                />
                {enhancing && (
                  <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
                    <div className="w-full h-full bg-gradient-to-r from-gray-200/0 via-white/80 to-gray-200/0 bg-[length:200%_100%] animate-shimmer" />
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">Video Format</label>
              <div className="flex gap-2 p-1 bg-gray-50 rounded-xl">
                <button
                  onClick={() => setVideoType("long")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-medium text-sm transition-all ${
                    videoType === "long" ? "bg-white text-gray-900 shadow-sm ring-1 ring-gray-200" : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  <PlaySquare className="w-4 h-4" /> 16:9
                </button>
                <button
                  onClick={() => setVideoType("shorts")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-medium text-sm transition-all ${
                    videoType === "shorts" ? "bg-white text-gray-900 shadow-sm ring-1 ring-gray-200" : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  <Smartphone className="w-4 h-4" /> 9:16
                </button>
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={!prompt.trim() || generating || enhancing}
              className="w-full py-6 text-base rounded-xl bg-blue-600 hover:bg-blue-700 shadow-md transition-all active:scale-95"
            >
              {generating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Clapperboard className="w-5 h-5 mr-2" />}
              {generating ? "Generating..." : "Generate Video"}
            </Button>

            {error && (
              <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm font-medium text-center">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Result + History Panel */}
        <div className="lg:col-span-8 space-y-6">
          {generating && (
            <div className="min-h-[300px] flex flex-col items-center justify-center bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-8 text-center space-y-6">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-75" />
                <div className="relative flex items-center justify-center w-full h-full bg-blue-600 text-white rounded-full">
                  <Clapperboard className="w-8 h-8 animate-pulse" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{statusText}</h3>
                <p className="text-blue-600 font-medium">Elapsed: {formatElapsed(elapsed)}</p>
                <p className="text-xs text-gray-400 mt-1">Video length depends on the model — this can take a few minutes.</p>
              </div>
            </div>
          )}

          {!generating && !videoUrl && (
            <div className="min-h-[300px] flex flex-col items-center justify-center bg-gray-50/50 rounded-2xl border border-gray-200 border-dashed text-gray-400 p-4 md:p-8 text-center">
              <Clapperboard className="w-16 h-16 mb-4 opacity-50" />
              <h3 className="text-lg font-semibold text-gray-700 mb-1">No Video Generated</h3>
              <p className="text-sm max-w-sm">Enter a prompt or topic and click generate to create your AI video.</p>
            </div>
          )}

          {!generating && videoUrl && (
            <Card className="overflow-hidden bg-gray-900 border-0 shadow-xl">
              <div className="p-4 md:p-6 flex flex-col items-center">
                <div className={`relative rounded-lg overflow-hidden border border-gray-800 shadow-2xl ${videoType === "long" ? "w-full aspect-[16/9]" : "w-[320px] aspect-[9/16]"}`}>
                  <video src={videoUrl} controls autoPlay loop className="w-full h-full object-cover" />
                </div>
                <div className="flex gap-3 mt-6">
                  <Button onClick={() => handleDownload(videoUrl)} className="bg-white text-gray-900 hover:bg-gray-100 rounded-full px-6">
                    <Download className="w-4 h-4 mr-2" /> Download
                  </Button>
                  <Button variant="secondary" onClick={handleGenerate} className="bg-gray-800 text-white hover:bg-gray-700 border-0 rounded-full px-6">
                    <RefreshCw className="w-4 h-4 mr-2" /> Regenerate
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* History */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Recent Generations</h3>
            {historyLoading ? (
              <p className="text-sm text-gray-400">Loading history...</p>
            ) : history.length === 0 ? (
              <p className="text-sm text-gray-400">No videos generated yet.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {history.map((item) => (
                  <Card key={item.id} className="shadow-sm overflow-hidden">
                    <CardBody className="p-0">
                      {item.status === "succeeded" && item.videoUrl ? (
                        <video src={item.videoUrl} muted loop className="w-full aspect-video object-cover" onMouseEnter={(e) => e.currentTarget.play()} onMouseLeave={(e) => e.currentTarget.pause()} />
                      ) : (
                        <div className="w-full aspect-video bg-gray-100 flex items-center justify-center text-xs text-gray-400">
                          {item.status === "failed" || item.status === "canceled" ? "Failed" : "Processing..."}
                        </div>
                      )}
                      <p className="text-xs text-gray-500 truncate p-2">{item.topic}</p>
                    </CardBody>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
