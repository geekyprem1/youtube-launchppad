"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ToolkitResultsView } from "@/components/toolkit-engine/ToolkitResultsView";
import type { ToolkitResponse } from "@/domains/toolkit-engine/types";
import {
  CREATOR_ASSETS,
  PUBLISH_CHECKLIST,
  TOOLKIT_CONTENT_TEMPLATES,
  type CreatorAsset,
} from "@/domains/toolkit-engine/assets";
import { cn } from "@/lib/utils";
import {
  Activity,
  PlaySquare,
  Smartphone,
  Zap,
  Loader2,
  Library,
  ClipboardList,
  LayoutTemplate,
  Copy,
  Check,
  CheckCircle2,
} from "lucide-react";

type Tab = "generate" | "assets" | "publish" | "templates";

const loadingMessages = [
  "Understanding your topic...",
  "Optimizing for YouTube SEO...",
  "Crafting high-CTR titles...",
  "Writing an optimized description...",
  "Finding the best keywords...",
  "Generating hashtags...",
  "Finalizing your Toolkit...",
];

export default function ToolkitEnginePage() {
  const [tab, setTab] = useState<Tab>("generate");
  const [videoType, setVideoType] = useState<"long" | "shorts">("long");
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [result, setResult] = useState<ToolkitResponse | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");
  const [publishDone, setPublishDone] = useState<Record<string, boolean>>({});
  const [assetFilter, setAssetFilter] = useState<string>("all");

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setResult(null);
    setError("");
    setLoadingMessageIndex(0);
    setTab("generate");

    const messageInterval = setInterval(() => {
      setLoadingMessageIndex((prev) =>
        prev < loadingMessages.length - 1 ? prev + 1 : prev
      );
    }, 1500);

    try {
      const res = await fetch("/api/toolkit-engine/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoType, topic }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      clearInterval(messageInterval);
      setLoading(false);
    }
  };

  async function copyText(text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(text.slice(0, 32));
    setTimeout(() => setCopied(""), 1500);
  }

  const filteredAssets =
    assetFilter === "all"
      ? CREATOR_ASSETS
      : CREATOR_ASSETS.filter((a) => a.category === assetFilter);

  const publishScore = Math.round(
    (Object.values(publishDone).filter(Boolean).length /
      PUBLISH_CHECKLIST.length) *
      100
  );

  return (
    <>
      <Header
        title="Creator Toolkit X"
        subtitle="Generate assets · Library · Publish checklist · Content templates"
      />

      <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["generate", "Generate", Zap],
              ["assets", "Assets", Library],
              ["publish", "Publish", ClipboardList],
              ["templates", "Templates", LayoutTemplate],
            ] as const
          ).map(([id, label, Icon]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium",
                tab === id
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-600 border-gray-200 hover:border-blue-200"
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {tab === "generate" && (
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
              <div className="flex gap-4 p-1.5 bg-gray-50 rounded-xl max-w-md mx-auto">
                <button
                  onClick={() => setVideoType("long")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium text-sm ${
                    videoType === "long"
                      ? "bg-white text-gray-900 shadow-sm ring-1 ring-gray-200"
                      : "text-gray-500"
                  }`}
                >
                  <PlaySquare className="w-4 h-4" /> Long Video
                </button>
                <button
                  onClick={() => setVideoType("shorts")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium text-sm ${
                    videoType === "shorts"
                      ? "bg-white text-gray-900 shadow-sm ring-1 ring-gray-200"
                      : "text-gray-500"
                  }`}
                >
                  <Smartphone className="w-4 h-4" /> YouTube Shorts
                </button>
              </div>

              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                placeholder="E.g., Best AI Tools 2026..."
                className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-xl text-lg outline-none"
              />

              <div className="flex justify-center">
                <Button
                  onClick={handleGenerate}
                  disabled={!topic.trim() || loading}
                  className="px-8 py-4 text-base rounded-xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Generating Toolkit...
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5 mr-2" />
                      Generate Toolkit
                    </>
                  )}
                </Button>
              </div>

              {error && (
                <div className="p-4 bg-red-50 text-red-700 rounded-xl text-center text-sm font-medium">
                  {error}
                </div>
              )}
            </div>

            {loading && (
              <div className="flex flex-col items-center justify-center py-20 space-y-6 bg-white rounded-2xl border">
                <Activity className="w-8 h-8 text-blue-600 animate-pulse" />
                <p className="text-gray-500 font-medium animate-pulse">
                  {loadingMessages[loadingMessageIndex]}
                </p>
              </div>
            )}

            {!loading && result && (
              <ToolkitResultsView
                initialResult={result}
                topic={topic}
                videoType={videoType}
              />
            )}
          </div>
        )}

        {tab === "assets" && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {(
                [
                  "all",
                  "cta",
                  "description",
                  "pinned",
                  "community",
                  "end_screen",
                  "script_block",
                ] as const
              ).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setAssetFilter(c)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-xs font-medium border",
                    assetFilter === c
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-600 border-gray-200"
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {filteredAssets.map((a: CreatorAsset) => (
                <Card key={a.id}>
                  <CardBody className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {a.title}
                        </p>
                        <Badge variant="blue" className="text-[10px] mt-1">
                          {a.category}
                        </Badge>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyText(a.body)}
                        className="text-gray-400 hover:text-blue-600"
                      >
                        {copied && a.body.startsWith(copied) ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <pre className="text-xs whitespace-pre-wrap font-sans text-gray-600 bg-gray-50 p-2 rounded-lg">
                      {a.body}
                    </pre>
                  </CardBody>
                </Card>
              ))}
            </div>
          </div>
        )}

        {tab === "publish" && (
          <div className="space-y-4">
            <Card className="border-blue-100">
              <CardBody className="p-5 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Publishing checklist
                  </h3>
                  <p className="text-sm text-gray-500">
                    Tick items before you hit Publish.
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-extrabold text-blue-600">
                    {publishScore}%
                  </p>
                  <p className="text-xs text-gray-500">ready</p>
                </div>
              </CardBody>
            </Card>
            <div className="space-y-2">
              {PUBLISH_CHECKLIST.map((item) => {
                const on = !!publishDone[item.id];
                return (
                  <label
                    key={item.id}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors",
                      on
                        ? "bg-blue-50 border-blue-200"
                        : "bg-white border-gray-200 hover:bg-gray-50"
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={on}
                      onChange={(e) =>
                        setPublishDone((p) => ({
                          ...p,
                          [item.id]: e.target.checked,
                        }))
                      }
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span
                      className={cn(
                        "text-sm",
                        on ? "text-blue-900 font-medium" : "text-gray-700"
                      )}
                    >
                      {item.label}
                    </span>
                    {on && (
                      <CheckCircle2 className="w-4 h-4 text-blue-600 ml-auto" />
                    )}
                  </label>
                );
              })}
            </div>
          </div>
        )}

        {tab === "templates" && (
          <div className="grid sm:grid-cols-2 gap-4">
            {TOOLKIT_CONTENT_TEMPLATES.map((t) => (
              <Card key={t.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex justify-between gap-2">
                    <h3 className="font-semibold text-gray-900 text-sm">
                      {t.name}
                    </h3>
                    <Badge variant="default" className="text-[10px]">
                      {t.niche}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{t.description}</p>
                </CardHeader>
                <CardBody className="space-y-3 flex-1">
                  <div>
                    <p className="text-[10px] font-bold uppercase text-gray-400 mb-1">
                      Title formulas
                    </p>
                    <ul className="space-y-1">
                      {t.title_formulas.map((f) => (
                        <li key={f} className="text-xs text-gray-700">
                          · {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase text-gray-400 mb-1">
                      Tags seed
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {t.tags_seed.map((tag) => (
                        <Badge key={tag} variant="blue" className="text-[10px]">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="w-full"
                    onClick={() => {
                      setTopic(t.sample_topic);
                      setVideoType(
                        t.id === "shorts-hook" ? "shorts" : "long"
                      );
                      setTab("generate");
                    }}
                  >
                    Use sample → Generate
                  </Button>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
