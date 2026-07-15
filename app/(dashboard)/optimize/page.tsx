"use client";

import { useEffect, useRef, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { scoreBg, scoreBarColor, cn } from "@/lib/utils";
import {
  Sliders,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
  Copy,
  Check,
  ClipboardCheck,
  XCircle,
  AlertTriangle,
  Sparkles,
  Rocket,
  Upload,
  X,
} from "lucide-react";

type Tab = "checklist" | "title" | "thumbnail";

interface TitleResult {
  overall_score: number;
  ctr_score: number;
  seo_score: number;
  emotional_score: number;
  length_score: number;
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  alternatives: { title: string; why: string }[];
  keywords: string[];
  verdict: string;
}

interface ThumbnailResult {
  overall_score: number;
  text_score: number;
  visual_score: number;
  emotion_score: number;
  contrast_score: number;
  strengths: string[];
  improvements: { point: string; fix: string }[];
  verdict: string;
  ctr_prediction: string;
}

interface ChecklistItem {
  id: string;
  category: string;
  label: string;
  status: "pass" | "warn" | "fail";
  score: number;
  detail: string;
  fix?: string;
}

interface ChecklistResult {
  metrics: {
    overall_score: number;
    rule_score: number;
    ai_score: number;
    pass_count: number;
    warn_count: number;
    fail_count: number;
  };
  checklist: ChecklistItem[];
  ai: {
    upload_ready_score: number;
    verdict: string;
    priority_fixes: {
      area: string;
      issue: string;
      fix: string;
      impact: string;
    }[];
    title_suggestions: string[];
    description_hooks: string[];
    tag_suggestions: string[];
    seo_summary: string;
    ctr_summary: string;
  };
}

function ScoreBar({ label, score }: { label: string; score: number }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="font-medium">{score}/100</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${scoreBarColor(score)}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

function StatusIcon({ status }: { status: "pass" | "warn" | "fail" }) {
  if (status === "pass")
    return <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />;
  if (status === "warn")
    return <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />;
  return <XCircle className="w-4 h-4 text-red-500 shrink-0" />;
}

export default function OptimizePage() {
  const [tab, setTab] = useState<Tab>("checklist");

  // Title state
  const [title, setTitle] = useState("");
  const [titleResult, setTitleResult] = useState<TitleResult | null>(null);
  const [titleLoading, setTitleLoading] = useState(false);
  const [titleError, setTitleError] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  // Thumbnail state
  const [thumbFile, setThumbFile] = useState<File | null>(null);
  const [thumbPreview, setThumbPreview] = useState<string | null>(null);
  const [thumbResult, setThumbResult] = useState<ThumbnailResult | null>(null);
  const [thumbLoading, setThumbLoading] = useState(false);
  const [thumbError, setThumbError] = useState("");
  const thumbInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (thumbPreview) URL.revokeObjectURL(thumbPreview);
    };
  }, [thumbPreview]);

  // Checklist state
  const [clTitle, setClTitle] = useState("");
  const [clDesc, setClDesc] = useState("");
  const [clTags, setClTags] = useState("");
  const [clCategory, setClCategory] = useState("");
  const [clVideoType, setClVideoType] = useState<"long" | "short" | "live">(
    "long"
  );
  const [clThumb, setClThumb] = useState(false);
  const [clEnd, setClEnd] = useState(false);
  const [clCards, setClCards] = useState(false);
  const [clChapters, setClChapters] = useState(false);
  const [clPlaylist, setClPlaylist] = useState(false);
  const [clLoading, setClLoading] = useState(false);
  const [clError, setClError] = useState("");
  const [clResult, setClResult] = useState<ChecklistResult | null>(null);

  async function analyzeTitle() {
    if (!title.trim()) return;
    setTitleLoading(true);
    setTitleError("");
    try {
      const res = await fetch("/api/titles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTitleResult(data.result);
    } catch (e) {
      setTitleError(e instanceof Error ? e.message : "Failed to analyze");
    } finally {
      setTitleLoading(false);
    }
  }

  function handleThumbSelect(file: File | null) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setThumbError("Please upload an image file (JPG, PNG, or WebP)");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setThumbError("Image must be under 5MB");
      return;
    }
    if (thumbPreview) URL.revokeObjectURL(thumbPreview);
    setThumbFile(file);
    setThumbPreview(URL.createObjectURL(file));
    setThumbResult(null);
    setThumbError("");
  }

  function clearThumb() {
    if (thumbPreview) URL.revokeObjectURL(thumbPreview);
    setThumbFile(null);
    setThumbPreview(null);
    setThumbResult(null);
    setThumbError("");
    if (thumbInputRef.current) thumbInputRef.current.value = "";
  }

  async function analyzeThumbnail() {
    if (!thumbFile) return;
    setThumbLoading(true);
    setThumbError("");
    try {
      const formData = new FormData();
      formData.append("image", thumbFile);
      const res = await fetch("/api/thumbnails", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setThumbResult(data.result);
    } catch (e) {
      setThumbError(e instanceof Error ? e.message : "Failed to analyze");
    } finally {
      setThumbLoading(false);
    }
  }

  async function runChecklist() {
    if (!clTitle.trim()) return;
    setClLoading(true);
    setClError("");
    setClResult(null);
    try {
      const res = await fetch("/api/rankpilot/checklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: clTitle,
          description: clDesc,
          tags: clTags,
          category: clCategory,
          video_type: clVideoType,
          thumbnail_ready: clThumb,
          end_screen: clEnd,
          cards: clCards,
          chapters: clChapters,
          playlist: clPlaylist,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checklist failed");
      setClResult(data as ChecklistResult);
    } catch (e) {
      setClError(e instanceof Error ? e.message : "Failed to run checklist");
    } finally {
      setClLoading(false);
    }
  }

  async function copyText(text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 1500);
  }

  const tabs: { id: Tab; label: string; icon: typeof Sliders }[] = [
    { id: "checklist", label: "Upload Checklist", icon: ClipboardCheck },
    { id: "title", label: "Title Analyzer", icon: Sliders },
    { id: "thumbnail", label: "Thumbnail Analyzer", icon: ImageIcon },
  ];

  return (
    <>
      <Header
        title="RankPilot"
        subtitle="Title · SEO · CTR · Upload suggestions — optimize every publish"
      />
      <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
        <div className="flex flex-wrap gap-1 bg-gray-100 p-1 rounded-xl w-fit">
          {tabs.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2",
                  tab === t.id
                    ? "bg-white shadow-sm text-gray-900"
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{t.label}</span>
                <span className="sm:hidden">
                  {t.id === "checklist"
                    ? "Upload"
                    : t.id === "title"
                      ? "Title"
                      : "Thumb"}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── Upload Checklist ── */}
        {tab === "checklist" && (
          <div className="space-y-6">
            <Card className="border-indigo-100">
              <CardBody className="p-5 md:p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                    <Rocket className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-900">
                      Pre-publish upload checklist
                    </h2>
                    <p className="text-sm text-gray-500 mt-0.5">
                      Paste your draft package. RankPilot scores SEO + CTR
                      readiness and tells you what to fix before you hit
                      Publish.
                    </p>
                  </div>
                </div>

                <Input
                  label="Video title *"
                  value={clTitle}
                  onChange={(e) => setClTitle(e.target.value)}
                  placeholder="Your planned YouTube title"
                />
                <Textarea
                  label="Description"
                  value={clDesc}
                  onChange={(e) => setClDesc(e.target.value)}
                  placeholder="First 2–3 lines should hook + include keywords…"
                  rows={4}
                />
                <Textarea
                  label="Tags (comma-separated)"
                  value={clTags}
                  onChange={(e) => setClTags(e.target.value)}
                  placeholder="ai tools, productivity, chat gpt tutorial, …"
                  rows={2}
                />
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input
                    label="Category"
                    value={clCategory}
                    onChange={(e) => setClCategory(e.target.value)}
                    placeholder="e.g. Education, Gaming"
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Video type
                    </label>
                    <select
                      value={clVideoType}
                      onChange={(e) =>
                        setClVideoType(e.target.value as "long" | "short" | "live")
                      }
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="long">Long-form</option>
                      <option value="short">Shorts</option>
                      <option value="live">Live</option>
                    </select>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Packaging & publish flags
                  </p>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {(
                      [
                        [clThumb, setClThumb, "Custom thumbnail ready"],
                        [clEnd, setClEnd, "End screen planned"],
                        [clCards, setClCards, "Cards planned"],
                        [clChapters, setClChapters, "Chapters / timestamps"],
                        [clPlaylist, setClPlaylist, "Added to playlist"],
                      ] as const
                    ).map(([val, set, label], i) => (
                      <label
                        key={i}
                        className={cn(
                          "flex items-center gap-2 text-sm px-3 py-2 rounded-lg border cursor-pointer transition-colors",
                          val
                            ? "bg-indigo-50 border-indigo-200 text-indigo-900"
                            : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={val}
                          onChange={(e) => set(e.target.checked)}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                </div>

                {clError && (
                  <p className="text-sm text-red-600 flex items-center gap-2">
                    <XCircle className="w-4 h-4" /> {clError}
                  </p>
                )}

                <Button
                  onClick={runChecklist}
                  loading={clLoading}
                  disabled={!clTitle.trim()}
                  className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  <ClipboardCheck className="w-4 h-4 mr-2" />
                  Run RankPilot checklist
                </Button>
              </CardBody>
            </Card>

            {clLoading && (
              <div className="h-64 bg-white rounded-xl border border-gray-200 animate-pulse" />
            )}

            {clResult && !clLoading && (
              <div className="space-y-6">
                <Card className="overflow-hidden border-indigo-100">
                  <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-6 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <p className="text-sm text-indigo-100 mb-1">
                        Upload readiness
                      </p>
                      <h2 className="text-xl font-bold">
                        {clResult.ai.verdict}
                      </h2>
                      <div className="flex flex-wrap gap-2 mt-3 text-xs">
                        <span className="bg-white/20 px-2 py-1 rounded-full">
                          {clResult.metrics.pass_count} pass
                        </span>
                        <span className="bg-white/20 px-2 py-1 rounded-full">
                          {clResult.metrics.warn_count} warn
                        </span>
                        <span className="bg-white/20 px-2 py-1 rounded-full">
                          {clResult.metrics.fail_count} fail
                        </span>
                      </div>
                    </div>
                    <div className="text-center">
                      <ScoreRing
                        score={clResult.metrics.overall_score}
                        size={96}
                      />
                      <p className="text-xs text-indigo-100 mt-1">Ready score</p>
                    </div>
                  </div>
                  <CardBody className="p-5 grid md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-blue-50/50 border border-blue-100">
                      <p className="text-xs font-bold text-blue-800 uppercase mb-1">
                        SEO summary
                      </p>
                      <p className="text-sm text-gray-700">
                        {clResult.ai.seo_summary}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-purple-50/50 border border-purple-100">
                      <p className="text-xs font-bold text-purple-800 uppercase mb-1">
                        CTR summary
                      </p>
                      <p className="text-sm text-gray-700">
                        {clResult.ai.ctr_summary}
                      </p>
                    </div>
                  </CardBody>
                </Card>

                <Card>
                  <CardHeader>
                    <h3 className="font-semibold text-sm text-gray-900">
                      Checklist results
                    </h3>
                  </CardHeader>
                  <CardBody className="space-y-2">
                    {clResult.checklist.map((item) => (
                      <div
                        key={item.id}
                        className={cn(
                          "flex gap-3 p-3 rounded-lg border",
                          item.status === "pass" &&
                            "bg-green-50/40 border-green-100",
                          item.status === "warn" &&
                            "bg-amber-50/40 border-amber-100",
                          item.status === "fail" &&
                            "bg-red-50/40 border-red-100"
                        )}
                      >
                        <StatusIcon status={item.status} />
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-medium text-gray-900">
                              {item.label}
                            </p>
                            <Badge
                              variant={
                                item.status === "pass"
                                  ? "green"
                                  : item.status === "warn"
                                    ? "yellow"
                                    : "red"
                              }
                              className="text-[10px] uppercase"
                            >
                              {item.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600 mt-0.5">
                            {item.detail}
                          </p>
                          {item.fix && (
                            <p className="text-xs text-indigo-700 mt-1">
                              → {item.fix}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </CardBody>
                </Card>

                {clResult.ai.priority_fixes?.length > 0 && (
                  <Card>
                    <CardHeader>
                      <h3 className="font-semibold text-sm text-gray-900 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-indigo-500" />
                        Priority fixes
                      </h3>
                    </CardHeader>
                    <CardBody className="space-y-2">
                      {clResult.ai.priority_fixes.map((f, i) => (
                        <div
                          key={i}
                          className="p-3 bg-gray-50 rounded-lg border border-gray-100"
                        >
                          <div className="flex flex-wrap gap-2 items-center mb-1">
                            <span className="text-xs font-bold text-gray-500 uppercase">
                              {f.area}
                            </span>
                            <Badge
                              variant={
                                f.impact === "high"
                                  ? "red"
                                  : f.impact === "medium"
                                    ? "yellow"
                                    : "default"
                              }
                              className="text-[10px]"
                            >
                              {f.impact} impact
                            </Badge>
                          </div>
                          <p className="text-sm font-medium text-gray-900">
                            {f.issue}
                          </p>
                          <p className="text-xs text-gray-600 mt-0.5">
                            Fix: {f.fix}
                          </p>
                        </div>
                      ))}
                    </CardBody>
                  </Card>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  {clResult.ai.title_suggestions?.length > 0 && (
                    <Card>
                      <CardHeader>
                        <h3 className="font-semibold text-sm text-gray-900">
                          Title suggestions
                        </h3>
                      </CardHeader>
                      <CardBody className="space-y-2">
                        {clResult.ai.title_suggestions.map((t, i) => (
                          <div
                            key={i}
                            className="flex items-start justify-between gap-2 p-2.5 bg-gray-50 rounded-lg"
                          >
                            <p className="text-sm text-gray-900 flex-1">{t}</p>
                            <button
                              type="button"
                              onClick={() => copyText(t)}
                              className="text-gray-400 hover:text-indigo-600 shrink-0"
                            >
                              {copied === t ? (
                                <Check className="w-4 h-4 text-green-500" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        ))}
                      </CardBody>
                    </Card>
                  )}
                  <div className="space-y-4">
                    {clResult.ai.description_hooks?.length > 0 && (
                      <Card>
                        <CardHeader>
                          <h3 className="font-semibold text-sm text-gray-900">
                            Description openers
                          </h3>
                        </CardHeader>
                        <CardBody className="space-y-2">
                          {clResult.ai.description_hooks.map((h, i) => (
                            <p
                              key={i}
                              className="text-sm text-gray-700 p-2 bg-gray-50 rounded-lg"
                            >
                              {h}
                            </p>
                          ))}
                        </CardBody>
                      </Card>
                    )}
                    {clResult.ai.tag_suggestions?.length > 0 && (
                      <Card>
                        <CardHeader>
                          <h3 className="font-semibold text-sm text-gray-900">
                            Suggested tags
                          </h3>
                        </CardHeader>
                        <CardBody>
                          <div className="flex flex-wrap gap-1.5">
                            {clResult.ai.tag_suggestions.map((tag, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => copyText(tag)}
                                className="text-left"
                              >
                                <Badge variant="blue">{tag}</Badge>
                              </button>
                            ))}
                          </div>
                        </CardBody>
                      </Card>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Title Tab ── */}
        {tab === "title" && (
          <div className="space-y-4">
            <Card>
              <CardBody>
                <div className="flex gap-3">
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Paste your YouTube video title here..."
                    onKeyDown={(e) => e.key === "Enter" && analyzeTitle()}
                    className="flex-1"
                  />
                  <Button
                    onClick={analyzeTitle}
                    loading={titleLoading}
                    disabled={!title.trim()}
                  >
                    Analyze
                  </Button>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  {title.length} characters{" "}
                  {title.length > 70 && "— too long! Keep under 70"}
                </p>
                {titleError && (
                  <p className="mt-2 text-sm text-red-500">{titleError}</p>
                )}
              </CardBody>
            </Card>

            {titleLoading && (
              <div className="h-64 bg-white rounded-xl border border-gray-200 animate-pulse" />
            )}

            {titleResult && !titleLoading && (
              <div className="grid md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <h3 className="font-semibold text-sm text-gray-900">
                      Overall Score
                    </h3>
                  </CardHeader>
                  <CardBody className="flex flex-col items-center gap-4">
                    <ScoreRing score={titleResult.overall_score} size={88} />
                    <div className="w-full space-y-2">
                      <ScoreBar
                        label="CTR Potential"
                        score={titleResult.ctr_score}
                      />
                      <ScoreBar label="SEO Score" score={titleResult.seo_score} />
                      <ScoreBar
                        label="Emotional Pull"
                        score={titleResult.emotional_score}
                      />
                      <ScoreBar
                        label="Length"
                        score={titleResult.length_score}
                      />
                    </div>
                  </CardBody>
                </Card>

                <Card className="md:col-span-2">
                  <CardHeader>
                    <h3 className="font-semibold text-sm text-gray-900">
                      Analysis
                    </h3>
                  </CardHeader>
                  <CardBody className="space-y-4">
                    <p className="text-sm text-gray-600 italic">
                      &ldquo;{titleResult.verdict}&rdquo;
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs font-semibold text-green-600 mb-1.5 flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" /> Strengths
                        </p>
                        <ul className="space-y-1">
                          {titleResult.strengths?.map((s, i) => (
                            <li
                              key={i}
                              className="text-xs text-gray-600 flex gap-1.5"
                            >
                              <span className="text-green-500 mt-0.5">•</span>
                              {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-red-500 mb-1.5 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" /> Weaknesses
                        </p>
                        <ul className="space-y-1">
                          {titleResult.weaknesses?.map((w, i) => (
                            <li
                              key={i}
                              className="text-xs text-gray-600 flex gap-1.5"
                            >
                              <span className="text-red-400 mt-0.5">•</span>
                              {w}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-700 mb-1.5">
                        Keywords Detected
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {titleResult.keywords?.map((k, i) => (
                          <Badge key={i} variant="blue">
                            {k}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardBody>
                </Card>

                <Card className="md:col-span-3">
                  <CardHeader>
                    <h3 className="font-semibold text-sm text-gray-900">
                      5 Better Alternatives
                    </h3>
                  </CardHeader>
                  <CardBody className="space-y-2">
                    {titleResult.alternatives?.map((alt, i) => (
                      <div
                        key={i}
                        className="flex items-start justify-between gap-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {alt.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {alt.why}
                          </p>
                        </div>
                        <button
                          onClick={() => copyText(alt.title)}
                          className="text-gray-400 hover:text-blue-600 transition-colors flex-shrink-0"
                        >
                          {copied === alt.title ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    ))}
                  </CardBody>
                </Card>
              </div>
            )}
          </div>
        )}

        {/* ── Thumbnail Tab ── */}
        {tab === "thumbnail" && (
          <div className="space-y-4">
            <Card>
              <CardBody className="space-y-4">
                <input
                  ref={thumbInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={(e) => handleThumbSelect(e.target.files?.[0] ?? null)}
                />

                {!thumbPreview ? (
                  <button
                    type="button"
                    onClick={() => thumbInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      handleThumbSelect(e.dataTransfer.files?.[0] ?? null);
                    }}
                    className="w-full border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-blue-300 hover:bg-blue-50/30 transition-colors"
                  >
                    <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm font-medium text-gray-900">
                      Upload your thumbnail
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Drag & drop or click to browse · JPG, PNG, WebP · max 5MB
                    </p>
                  </button>
                ) : (
                  <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={thumbPreview}
                      alt="Thumbnail preview"
                      className="w-full max-h-72 object-contain mx-auto"
                    />
                    <button
                      type="button"
                      onClick={clearThumb}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 border border-gray-200 text-gray-500 hover:text-gray-800 shadow-sm"
                      aria-label="Remove thumbnail"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <Button
                  onClick={analyzeThumbnail}
                  loading={thumbLoading}
                  disabled={!thumbFile}
                  className="w-full"
                >
                  Analyze Thumbnail
                </Button>
                {thumbError && (
                  <p className="text-sm text-red-500">{thumbError}</p>
                )}
              </CardBody>
            </Card>

            {thumbLoading && (
              <div className="h-64 bg-white rounded-xl border border-gray-200 animate-pulse" />
            )}

            {thumbResult && !thumbLoading && (
              <div className="grid md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <h3 className="font-semibold text-sm text-gray-900">
                      Thumbnail Score
                    </h3>
                  </CardHeader>
                  <CardBody className="flex flex-col items-center gap-4">
                    <ScoreRing score={thumbResult.overall_score} size={88} />
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${scoreBg(thumbResult.overall_score)}`}
                    >
                      CTR Prediction:{" "}
                      {thumbResult.ctr_prediction?.toUpperCase()}
                    </div>
                    <div className="w-full space-y-2">
                      <ScoreBar
                        label="Text Readability"
                        score={thumbResult.text_score}
                      />
                      <ScoreBar
                        label="Visual Appeal"
                        score={thumbResult.visual_score}
                      />
                      <ScoreBar
                        label="Emotion Impact"
                        score={thumbResult.emotion_score}
                      />
                      <ScoreBar
                        label="Color Contrast"
                        score={thumbResult.contrast_score}
                      />
                    </div>
                  </CardBody>
                </Card>

                <Card className="md:col-span-2">
                  <CardHeader>
                    <h3 className="font-semibold text-sm text-gray-900">
                      Improvement Suggestions
                    </h3>
                  </CardHeader>
                  <CardBody className="space-y-3">
                    <p className="text-sm text-gray-500 italic">
                      &ldquo;{thumbResult.verdict}&rdquo;
                    </p>
                    {thumbResult.strengths?.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-green-600 mb-1">
                          What&apos;s working
                        </p>
                        <ul className="space-y-1">
                          {thumbResult.strengths.map((s, i) => (
                            <li
                              key={i}
                              className="text-xs text-gray-600 flex gap-1.5"
                            >
                              <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />
                              {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-semibold text-orange-600 mb-2">
                        Fix These
                      </p>
                      <div className="space-y-2">
                        {thumbResult.improvements?.map((imp, i) => (
                          <div key={i} className="p-2.5 bg-orange-50 rounded-lg">
                            <p className="text-xs font-medium text-orange-700">
                              {imp.point}
                            </p>
                            <p className="text-xs text-gray-600 mt-0.5">
                              → {imp.fix}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
