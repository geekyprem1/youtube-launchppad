"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Flame, PlaySquare, Smartphone, Loader2, Image as ImageIcon, Copy, Download, RefreshCw, CheckCircle2 } from "lucide-react";

const LOADING_MESSAGES = [
  "Studying the topic...",
  "Finding the shock factor...",
  "Maximizing curiosity gap...",
  "Adding bold callouts...",
  "Cranking up the contrast...",
  "Rendering thumbnail...",
];

interface GenerationResult {
  imageUrl: string;
  clickbaitPrompt: string;
  generationTime: number;
}

interface HistoryItem {
  id: string;
  videoType: "long" | "shorts";
  topic: string;
  clickbaitPrompt: string;
  imageUrl: string;
  createdAt: string;
}

export default function ClickbaitThumbnailPage() {
  const [videoType, setVideoType] = useState<"long" | "shorts">("long");
  const [topic, setTopic] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState("");
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  const loadHistory = async () => {
    try {
      const res = await fetch("/api/clickbait-thumbnail/history");
      const data = await res.json();
      if (res.ok) {
        setHistory(
          (data.data || []).map((row: any) => ({
            id: row.id,
            videoType: row.video_type,
            topic: row.topic,
            clickbaitPrompt: row.clickbait_prompt,
            imageUrl: row.image_url,
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
  }, []);

  const handleGenerate = async () => {
    if (!topic.trim()) return;

    setLoading(true);
    setResult(null);
    setError("");
    setLoadingMessageIndex(0);

    const messageInterval = setInterval(() => {
      setLoadingMessageIndex((prev) => (prev < LOADING_MESSAGES.length - 1 ? prev + 1 : prev));
    }, 1500);

    try {
      const res = await fetch("/api/clickbait-thumbnail/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoType, topic }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");

      setResult(data);
      loadHistory();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate clickbait thumbnail");
    } finally {
      clearInterval(messageInterval);
      setLoading(false);
    }
  };

  const handleCopyPrompt = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.clickbaitPrompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleDownload = async (imageUrl: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `clickbait-thumbnail-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Failed to download image", e);
      window.open(imageUrl, "_blank");
    }
  };

  return (
    <>
      <Header
        title="Clickbait Thumbnail Maker"
        subtitle="Turn any topic into a maximum-CTR clickbait thumbnail."
      />

      <div className="p-4 md:p-8 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        {/* Input Panel */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
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

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">What is the video about?</label>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="E.g., I survived 100 days in the wilderness"
                className="w-full h-24 px-4 py-3 bg-gray-50 border border-gray-200 focus:border-orange-500 focus:bg-white rounded-xl text-sm transition-all outline-none resize-none"
              />
            </div>

            <Button
              onClick={handleGenerate}
              disabled={!topic.trim() || loading}
              className="w-full py-6 text-base rounded-xl bg-orange-600 hover:bg-orange-700 shadow-md transition-all active:scale-95"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Flame className="w-5 h-5 mr-2" />}
              {loading ? "Generating..." : "Generate Clickbait Thumbnail"}
            </Button>

            {error && (
              <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm font-medium text-center">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Results + History Panel */}
        <div className="lg:col-span-8 space-y-6">
          {loading && (
            <div className="min-h-[400px] flex flex-col items-center justify-center bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-8 text-center space-y-6">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 bg-orange-100 rounded-full animate-ping opacity-75" />
                <div className="relative flex items-center justify-center w-full h-full bg-orange-600 text-white rounded-full">
                  <Flame className="w-8 h-8 animate-pulse" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">AI is working...</h3>
                <p className="text-orange-600 font-medium animate-pulse">
                  {LOADING_MESSAGES[loadingMessageIndex]}
                </p>
              </div>
            </div>
          )}

          {!loading && !result && (
            <div className="min-h-[400px] flex flex-col items-center justify-center bg-gray-50/50 rounded-2xl border border-gray-200 border-dashed text-gray-400 p-4 md:p-8 text-center">
              <Flame className="w-16 h-16 mb-4 opacity-50" />
              <h3 className="text-lg font-semibold text-gray-700 mb-1">No Thumbnail Generated</h3>
              <p className="text-sm max-w-sm">Enter a topic and click generate to create your clickbait thumbnail.</p>
            </div>
          )}

          {!loading && result && (
            <div className="space-y-6">
              <Card className="overflow-hidden bg-gray-900 border-0 shadow-xl">
                <div className="p-4 md:p-6 flex flex-col items-center">
                  <div className={`relative rounded-lg overflow-hidden border border-gray-800 shadow-2xl ${videoType === "long" ? "w-full aspect-[16/9]" : "w-[320px] aspect-[9/16]"}`}>
                    <img src={result.imageUrl} alt="Generated Clickbait Thumbnail" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex gap-3 mt-6">
                    <Button onClick={() => handleDownload(result.imageUrl)} className="bg-white text-gray-900 hover:bg-gray-100 rounded-full px-6">
                      <Download className="w-4 h-4 mr-2" /> Download
                    </Button>
                    <Button variant="secondary" onClick={handleGenerate} className="bg-gray-800 text-white hover:bg-gray-700 border-0 rounded-full px-6">
                      <RefreshCw className="w-4 h-4 mr-2" /> Regenerate
                    </Button>
                  </div>
                </div>
              </Card>

              <Card className="shadow-sm">
                <CardBody className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-900 text-sm">Clickbait Prompt Used</h4>
                    <button onClick={handleCopyPrompt} className="text-gray-400 hover:text-orange-600 transition-colors p-1">
                      {copiedPrompt ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-sm text-gray-600 leading-relaxed max-h-[160px] overflow-y-auto">
                    {result.clickbaitPrompt}
                  </div>
                </CardBody>
              </Card>
            </div>
          )}

          {/* History */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Recent Generations</h3>
            {historyLoading ? (
              <p className="text-sm text-gray-400">Loading history...</p>
            ) : history.length === 0 ? (
              <p className="text-sm text-gray-400">No thumbnails generated yet.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {history.map((item) => (
                  <div key={item.id} className="group relative rounded-lg overflow-hidden border border-gray-200 bg-gray-100 aspect-video">
                    <img src={item.imageUrl} alt={item.topic} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleDownload(item.imageUrl)}
                        className="p-2 bg-white/90 rounded-full text-gray-900 hover:bg-white"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
