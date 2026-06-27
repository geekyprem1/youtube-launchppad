"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { scoreBg, scoreBarColor } from "@/lib/utils";
import { Sliders, Image as ImageIcon, CheckCircle, AlertCircle, Copy, Check } from "lucide-react";

type Tab = "title" | "thumbnail";

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

export default function OptimizePage() {
  const [tab, setTab] = useState<Tab>("title");

  // Title state
  const [title, setTitle] = useState("");
  const [titleResult, setTitleResult] = useState<TitleResult | null>(null);
  const [titleLoading, setTitleLoading] = useState(false);
  const [titleError, setTitleError] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  // Thumbnail state
  const [imageUrl, setImageUrl] = useState("");
  const [thumbDesc, setThumbDesc] = useState("");
  const [thumbResult, setThumbResult] = useState<ThumbnailResult | null>(null);
  const [thumbLoading, setThumbLoading] = useState(false);
  const [thumbError, setThumbError] = useState("");

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

  async function analyzeThumbnail() {
    if (!imageUrl.trim() && !thumbDesc.trim()) return;
    setThumbLoading(true);
    setThumbError("");
    try {
      const res = await fetch("/api/thumbnails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: imageUrl.trim() || undefined, description: thumbDesc.trim() || undefined }),
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

  async function copyText(text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 1500);
  }

  return (
    <>
      <Header title="Title & Thumbnail Optimizer" subtitle="Maximize your click-through rate with AI scoring" />
      <div className="p-6 max-w-4xl mx-auto space-y-6">

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
          {(["title", "thumbnail"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === t ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t === "title" ? (
                <span className="flex items-center gap-2"><Sliders className="w-4 h-4" /> Title Analyzer</span>
              ) : (
                <span className="flex items-center gap-2"><ImageIcon className="w-4 h-4" /> Thumbnail Analyzer</span>
              )}
            </button>
          ))}
        </div>

        {/* Title Tab */}
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
                  <Button onClick={analyzeTitle} loading={titleLoading} disabled={!title.trim()}>
                    Analyze
                  </Button>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  {title.length} characters {title.length > 70 && "— too long! Keep under 70"}
                </p>
                {titleError && <p className="mt-2 text-sm text-red-500">{titleError}</p>}
              </CardBody>
            </Card>

            {titleLoading && <div className="h-64 bg-white rounded-xl border border-gray-200 animate-pulse" />}

            {titleResult && !titleLoading && (
              <div className="grid md:grid-cols-3 gap-4">
                {/* Score Overview */}
                <Card>
                  <CardHeader><h3 className="font-semibold text-sm text-gray-900">Overall Score</h3></CardHeader>
                  <CardBody className="flex flex-col items-center gap-4">
                    <ScoreRing score={titleResult.overall_score} size={88} />
                    <div className="w-full space-y-2">
                      <ScoreBar label="CTR Potential" score={titleResult.ctr_score} />
                      <ScoreBar label="SEO Score" score={titleResult.seo_score} />
                      <ScoreBar label="Emotional Pull" score={titleResult.emotional_score} />
                      <ScoreBar label="Length" score={titleResult.length_score} />
                    </div>
                  </CardBody>
                </Card>

                {/* Analysis */}
                <Card className="md:col-span-2">
                  <CardHeader><h3 className="font-semibold text-sm text-gray-900">Analysis</h3></CardHeader>
                  <CardBody className="space-y-4">
                    <p className="text-sm text-gray-600 italic">"{titleResult.verdict}"</p>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs font-semibold text-green-600 mb-1.5 flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" /> Strengths
                        </p>
                        <ul className="space-y-1">
                          {titleResult.strengths?.map((s, i) => (
                            <li key={i} className="text-xs text-gray-600 flex gap-1.5">
                              <span className="text-green-500 mt-0.5">•</span>{s}
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
                            <li key={i} className="text-xs text-gray-600 flex gap-1.5">
                              <span className="text-red-400 mt-0.5">•</span>{w}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-gray-700 mb-1.5">Keywords Detected</p>
                      <div className="flex flex-wrap gap-1.5">
                        {titleResult.keywords?.map((k, i) => (
                          <Badge key={i} variant="blue">{k}</Badge>
                        ))}
                      </div>
                    </div>
                  </CardBody>
                </Card>

                {/* Alternatives */}
                <Card className="md:col-span-3">
                  <CardHeader><h3 className="font-semibold text-sm text-gray-900">5 Better Alternatives</h3></CardHeader>
                  <CardBody className="space-y-2">
                    {titleResult.alternatives?.map((alt, i) => (
                      <div key={i} className="flex items-start justify-between gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{alt.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{alt.why}</p>
                        </div>
                        <button
                          onClick={() => copyText(alt.title)}
                          className="text-gray-400 hover:text-blue-600 transition-colors flex-shrink-0"
                        >
                          {copied === alt.title ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    ))}
                  </CardBody>
                </Card>
              </div>
            )}
          </div>
        )}

        {/* Thumbnail Tab */}
        {tab === "thumbnail" && (
          <div className="space-y-4">
            <Card>
              <CardBody className="space-y-3">
                <Input
                  label="Thumbnail Image URL (paste direct image URL or YouTube video URL)"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://i.ytimg.com/vi/... or any image URL"
                />
                <div className="text-center text-xs text-gray-400">— or describe your thumbnail —</div>
                <Textarea
                  label="Thumbnail Description"
                  value={thumbDesc}
                  onChange={(e) => setThumbDesc(e.target.value)}
                  placeholder="Describe what's in your thumbnail: e.g. 'Red background, large yellow text saying EXPOSED, man with shocked face, phone mockup on right side'"
                  rows={3}
                />
                <Button
                  onClick={analyzeThumbnail}
                  loading={thumbLoading}
                  disabled={!imageUrl.trim() && !thumbDesc.trim()}
                  className="w-full"
                >
                  Analyze Thumbnail
                </Button>
                {thumbError && <p className="text-sm text-red-500">{thumbError}</p>}
              </CardBody>
            </Card>

            {thumbLoading && <div className="h-64 bg-white rounded-xl border border-gray-200 animate-pulse" />}

            {thumbResult && !thumbLoading && (
              <div className="grid md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader><h3 className="font-semibold text-sm text-gray-900">Thumbnail Score</h3></CardHeader>
                  <CardBody className="flex flex-col items-center gap-4">
                    <ScoreRing score={thumbResult.overall_score} size={88} />
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold ${scoreBg(thumbResult.overall_score)}`}>
                      CTR Prediction: {thumbResult.ctr_prediction?.toUpperCase()}
                    </div>
                    <div className="w-full space-y-2">
                      <ScoreBar label="Text Readability" score={thumbResult.text_score} />
                      <ScoreBar label="Visual Appeal" score={thumbResult.visual_score} />
                      <ScoreBar label="Emotion Impact" score={thumbResult.emotion_score} />
                      <ScoreBar label="Color Contrast" score={thumbResult.contrast_score} />
                    </div>
                  </CardBody>
                </Card>

                <Card className="md:col-span-2">
                  <CardHeader><h3 className="font-semibold text-sm text-gray-900">Improvement Suggestions</h3></CardHeader>
                  <CardBody className="space-y-3">
                    <p className="text-sm text-gray-500 italic">"{thumbResult.verdict}"</p>
                    {thumbResult.strengths?.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-green-600 mb-1">What's working</p>
                        <ul className="space-y-1">
                          {thumbResult.strengths.map((s, i) => (
                            <li key={i} className="text-xs text-gray-600 flex gap-1.5">
                              <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />{s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-semibold text-orange-600 mb-2">Fix These</p>
                      <div className="space-y-2">
                        {thumbResult.improvements?.map((imp, i) => (
                          <div key={i} className="p-2.5 bg-orange-50 rounded-lg">
                            <p className="text-xs font-medium text-orange-700">{imp.point}</p>
                            <p className="text-xs text-gray-600 mt-0.5">→ {imp.fix}</p>
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
