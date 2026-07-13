"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { cn, scoreBarColor } from "@/lib/utils";
import { CLICKBOOST_TEMPLATES } from "@/domains/clickbait-thumbnail/templates";
import {
  Flame,
  PlaySquare,
  Smartphone,
  Loader2,
  Copy,
  Download,
  RefreshCw,
  CheckCircle2,
  LayoutTemplate,
  ScanSearch,
  Sparkles,
} from "lucide-react";

const LOADING_MESSAGES = [
  "Studying the topic...",
  "Applying template style...",
  "Maximizing curiosity gap...",
  "Adding bold callouts...",
  "Rendering thumbnail...",
];

type Tab = "generate" | "templates" | "analyze";

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
  const [tab, setTab] = useState<Tab>("generate");
  const [videoType, setVideoType] = useState<"long" | "shorts">("long");
  const [topic, setTopic] = useState("");
  const [templateId, setTemplateId] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState("");
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  // Analyze
  const [analyzeDesc, setAnalyzeDesc] = useState("");
  const [analyzeUrl, setAnalyzeUrl] = useState("");
  const [analyzeLoading, setAnalyzeLoading] = useState(false);
  const [analyzeError, setAnalyzeError] = useState("");
  const [analyzeResult, setAnalyzeResult] = useState<any>(null);

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
      // ignore
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
    try {
      const prefill = sessionStorage.getItem("faceless_thumb_topic");
      if (prefill) {
        setTopic(prefill);
        sessionStorage.removeItem("faceless_thumb_topic");
      }
    } catch {
      // ignore
    }
  }, []);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setResult(null);
    setError("");
    setLoadingMessageIndex(0);
    setTab("generate");

    const messageInterval = setInterval(() => {
      setLoadingMessageIndex((prev) =>
        prev < LOADING_MESSAGES.length - 1 ? prev + 1 : prev
      );
    }, 1500);

    try {
      const res = await fetch("/api/clickbait-thumbnail/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoType,
          topic,
          templateId: templateId || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      setResult(data);
      loadHistory();
    } catch (err: any) {
      setError(err.message || "Failed to generate");
    } finally {
      clearInterval(messageInterval);
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!analyzeUrl.trim() && !analyzeDesc.trim()) return;
    setAnalyzeLoading(true);
    setAnalyzeError("");
    setAnalyzeResult(null);
    try {
      const res = await fetch("/api/clickbait-thumbnail/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: analyzeUrl.trim() || undefined,
          description: analyzeDesc.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analyze failed");
      setAnalyzeResult(data.result);
    } catch (e: any) {
      setAnalyzeError(e.message || "Failed");
    } finally {
      setAnalyzeLoading(false);
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
      a.download = `clickboost-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      window.open(imageUrl, "_blank");
    }
  };

  const selectedTemplate = CLICKBOOST_TEMPLATES.find((t) => t.id === templateId);

  return (
    <>
      <Header
        title="ClickBoost"
        subtitle="Thumbnail generator · Style templates · CTR analyzer"
      />

      <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["generate", "Generate", Sparkles],
              ["templates", "Templates", LayoutTemplate],
              ["analyze", "Analyzer", ScanSearch],
            ] as const
          ).map(([id, label, Icon]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium",
                tab === id
                  ? "bg-orange-600 text-white border-orange-600"
                  : "bg-white text-gray-600 border-gray-200 hover:border-orange-200"
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {tab === "templates" && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Pick a style pack, then generate — template steers composition,
              colors, and text energy.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {CLICKBOOST_TEMPLATES.map((t) => {
                const on = templateId === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTemplateId(on ? null : t.id)}
                    className={cn(
                      "text-left p-4 rounded-xl border transition-all",
                      on
                        ? "border-orange-500 ring-2 ring-orange-200 bg-orange-50/50"
                        : "border-gray-200 bg-white hover:border-orange-200"
                    )}
                  >
                    <div className="flex justify-between gap-2 mb-1">
                      <p className="font-semibold text-sm text-gray-900">
                        {t.name}
                      </p>
                      <Badge variant="default" className="text-[10px]">
                        {t.category}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">{t.description}</p>
                    <p className="text-[11px] text-orange-700">
                      Best for: {t.best_for}
                    </p>
                    {on && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {t.sample_topics.map((s) => (
                          <span
                            key={s}
                            role="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setTopic(s);
                              setTab("generate");
                            }}
                            className="text-[10px] px-1.5 py-0.5 bg-white border border-orange-100 rounded text-gray-600 hover:border-orange-300"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            <Button
              onClick={() => setTab("generate")}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              Use template & generate
            </Button>
          </div>
        )}

        {tab === "analyze" && (
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardBody className="p-5 space-y-4">
                <h3 className="font-semibold text-gray-900">
                  Thumbnail CTR analyzer
                </h3>
                <input
                  value={analyzeUrl}
                  onChange={(e) => setAnalyzeUrl(e.target.value)}
                  placeholder="Image URL (optional)"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-orange-500"
                />
                <textarea
                  value={analyzeDesc}
                  onChange={(e) => setAnalyzeDesc(e.target.value)}
                  placeholder="Or describe your thumbnail…"
                  rows={4}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-orange-500 resize-none"
                />
                {analyzeError && (
                  <p className="text-sm text-red-600">{analyzeError}</p>
                )}
                <Button
                  onClick={handleAnalyze}
                  loading={analyzeLoading}
                  disabled={!analyzeUrl.trim() && !analyzeDesc.trim()}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                >
                  Analyze CTR potential
                </Button>
              </CardBody>
            </Card>
            <div>
              {analyzeLoading && (
                <div className="h-64 bg-white border rounded-xl animate-pulse" />
              )}
              {analyzeResult && !analyzeLoading && (
                <Card>
                  <CardBody className="p-5 space-y-4">
                    <div className="flex items-center gap-4">
                      <ScoreRing
                        score={analyzeResult.overall_score || 0}
                        size={80}
                      />
                      <div>
                        <p className="font-semibold text-gray-900">
                          Overall score
                        </p>
                        <p className="text-sm text-gray-500 italic">
                          {analyzeResult.verdict}
                        </p>
                        <Badge variant="yellow" className="mt-1">
                          CTR: {analyzeResult.ctr_prediction}
                        </Badge>
                      </div>
                    </div>
                    {(
                      [
                        ["Text", analyzeResult.text_score],
                        ["Visual", analyzeResult.visual_score],
                        ["Emotion", analyzeResult.emotion_score],
                        ["Contrast", analyzeResult.contrast_score],
                      ] as const
                    ).map(([label, score]) => (
                      <div key={label}>
                        <div className="flex justify-between text-xs mb-1">
                          <span>{label}</span>
                          <span>{score}/100</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full",
                              scoreBarColor(score || 0)
                            )}
                            style={{ width: `${score || 0}%` }}
                          />
                        </div>
                      </div>
                    ))}
                    {analyzeResult.improvements?.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-bold text-orange-700">
                          Fixes
                        </p>
                        {analyzeResult.improvements.map((imp: any, i: number) => (
                          <div
                            key={i}
                            className="text-xs p-2 bg-orange-50 rounded-lg"
                          >
                            <p className="font-medium text-orange-800">
                              {imp.point}
                            </p>
                            <p className="text-gray-600">→ {imp.fix}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardBody>
                </Card>
              )}
            </div>
          </div>
        )}

        {tab === "generate" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
                {selectedTemplate && (
                  <div className="p-3 rounded-xl bg-orange-50 border border-orange-100 text-xs">
                    <p className="font-semibold text-orange-900">
                      Template: {selectedTemplate.name}
                    </p>
                    <p className="text-orange-800/80 mt-0.5">
                      {selectedTemplate.description}
                    </p>
                    <button
                      type="button"
                      onClick={() => setTemplateId(null)}
                      className="text-orange-600 font-medium mt-1"
                    >
                      Clear template
                    </button>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Video Format
                  </label>
                  <div className="flex gap-2 p-1 bg-gray-50 rounded-xl">
                    <button
                      onClick={() => setVideoType("long")}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-medium text-sm transition-all ${
                        videoType === "long"
                          ? "bg-white text-gray-900 shadow-sm ring-1 ring-gray-200"
                          : "text-gray-500"
                      }`}
                    >
                      <PlaySquare className="w-4 h-4" /> 16:9
                    </button>
                    <button
                      onClick={() => setVideoType("shorts")}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-medium text-sm transition-all ${
                        videoType === "shorts"
                          ? "bg-white text-gray-900 shadow-sm ring-1 ring-gray-200"
                          : "text-gray-500"
                      }`}
                    >
                      <Smartphone className="w-4 h-4" /> 9:16
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    What is the video about?
                  </label>
                  <textarea
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="E.g., I survived 100 days in the wilderness"
                    className="w-full h-24 px-4 py-3 bg-gray-50 border border-gray-200 focus:border-orange-500 focus:bg-white rounded-xl text-sm outline-none resize-none"
                  />
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={!topic.trim() || loading}
                  className="w-full py-6 text-base rounded-xl bg-orange-600 hover:bg-orange-700"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Flame className="w-5 h-5 mr-2" />
                  )}
                  {loading ? "Generating..." : "Generate ClickBoost"}
                </Button>

                <button
                  type="button"
                  onClick={() => setTab("templates")}
                  className="w-full text-sm text-orange-700 font-medium"
                >
                  Browse style templates →
                </button>

                {error && (
                  <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm text-center">
                    {error}
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-8 space-y-6">
              {loading && (
                <div className="min-h-[400px] flex flex-col items-center justify-center bg-white rounded-2xl border p-8 text-center space-y-6">
                  <div className="relative w-16 h-16">
                    <div className="absolute inset-0 bg-orange-100 rounded-full animate-ping opacity-75" />
                    <div className="relative flex items-center justify-center w-full h-full bg-orange-600 text-white rounded-full">
                      <Flame className="w-8 h-8 animate-pulse" />
                    </div>
                  </div>
                  <p className="text-orange-600 font-medium animate-pulse">
                    {LOADING_MESSAGES[loadingMessageIndex]}
                  </p>
                </div>
              )}

              {!loading && !result && (
                <div className="min-h-[400px] flex flex-col items-center justify-center bg-gray-50/50 rounded-2xl border border-dashed text-gray-400 p-8 text-center">
                  <Flame className="w-16 h-16 mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-1">
                    Ready to ClickBoost
                  </h3>
                  <p className="text-sm max-w-sm">
                    Optional: pick a template, then generate a high-CTR
                    thumbnail.
                  </p>
                </div>
              )}

              {!loading && result && (
                <div className="space-y-6">
                  <Card className="overflow-hidden bg-gray-900 border-0 shadow-xl">
                    <div className="p-4 md:p-6 flex flex-col items-center">
                      <div
                        className={`relative rounded-lg overflow-hidden border border-gray-800 ${
                          videoType === "long"
                            ? "w-full aspect-[16/9]"
                            : "w-[320px] aspect-[9/16]"
                        }`}
                      >
                        <img
                          src={result.imageUrl}
                          alt="ClickBoost thumbnail"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex gap-3 mt-6">
                        <Button
                          onClick={() => handleDownload(result.imageUrl)}
                          className="bg-white text-gray-900 hover:bg-gray-100 rounded-full px-6"
                        >
                          <Download className="w-4 h-4 mr-2" /> Download
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={handleGenerate}
                          className="bg-gray-800 text-white hover:bg-gray-700 border-0 rounded-full px-6"
                        >
                          <RefreshCw className="w-4 h-4 mr-2" /> Regenerate
                        </Button>
                      </div>
                    </div>
                  </Card>
                  <Card>
                    <CardBody className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-900 text-sm">
                          Prompt used
                        </h4>
                        <button
                          onClick={handleCopyPrompt}
                          className="text-gray-400 hover:text-orange-600 p-1"
                        >
                          {copiedPrompt ? (
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-600 max-h-[160px] overflow-y-auto">
                        {result.clickbaitPrompt}
                      </div>
                    </CardBody>
                  </Card>
                </div>
              )}

              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Recent generations
                </h3>
                {historyLoading ? (
                  <p className="text-sm text-gray-400">Loading…</p>
                ) : history.length === 0 ? (
                  <p className="text-sm text-gray-400">None yet.</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {history.map((item) => (
                      <div
                        key={item.id}
                        className="group relative rounded-lg overflow-hidden border aspect-video bg-gray-100"
                      >
                        <img
                          src={item.imageUrl}
                          alt={item.topic}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center">
                          <button
                            onClick={() => handleDownload(item.imageUrl)}
                            className="p-2 bg-white/90 rounded-full"
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
        )}
      </div>
    </>
  );
}
