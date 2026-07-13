"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { ScoreRing } from "@/components/ui/ScoreRing";
import {
  CheckCircle,
  TrendingUp,
  Target,
  Activity,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  ArrowRightLeft,
  Trophy,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

type ABResult = {
  winner: "A" | "B" | "tie";
  confidence: number;
  summary: string;
  why_winner: string[];
  variant_a: {
    label: string;
    score: number;
    estimated_ctr: string;
    strengths: string[];
    weaknesses: string[];
  };
  variant_b: {
    label: string;
    score: number;
    estimated_ctr: string;
    strengths: string[];
    weaknesses: string[];
  };
  recommendation: string;
};

export default function PredictorPage() {
  const [tab, setTab] = useState<"predict" | "ab-test">("predict");
  const [topic, setTopic] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [predictError, setPredictError] = useState("");

  // A/B state
  const [abMode, setAbMode] = useState<"title" | "thumbnail">("title");
  const [abTopic, setAbTopic] = useState("");
  const [variantA, setVariantA] = useState("");
  const [variantB, setVariantB] = useState("");
  const [abLoading, setAbLoading] = useState(false);
  const [abResult, setAbResult] = useState<ABResult | null>(null);
  const [abError, setAbError] = useState("");

  async function runPrediction() {
    if (!topic.trim() || !title.trim()) return;
    setLoading(true);
    setResult(null);
    setPredictError("");

    try {
      const res = await fetch("/api/predictor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, title }),
      });
      const data = await res.json();

      if (!res.ok) {
        setPredictError(data.error || "Prediction failed");
        return;
      }

      if (data.metrics) {
        setResult({
          current_score: data.metrics.current_score,
          optimized_score: data.metrics.optimized_score,
          confidence: data.metrics.confidence,
          confidence_reason: data.analysis?.confidence_reason,
          estimated_ctr: data.metrics.estimated_ctr,
          estimated_retention: data.metrics.estimated_retention,
          strengths: data.analysis?.strengths || [],
          risks: data.analysis?.risks || [],
          improvements: data.analysis?.improvements || [],
        });
      }
    } catch (err) {
      console.error(err);
      setPredictError("Network error — try again");
    } finally {
      setLoading(false);
    }
  }

  async function runABTest() {
    if (!variantA.trim() || !variantB.trim()) return;
    setAbLoading(true);
    setAbResult(null);
    setAbError("");

    try {
      const res = await fetch("/api/predictor/ab", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: abMode,
          topic: abTopic,
          variant_a: variantA,
          variant_b: variantB,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setAbError(data.error || "A/B simulation failed");
        return;
      }

      if (data.analysis) {
        setAbResult(data.analysis as ABResult);
      } else {
        setAbError("Unexpected response from server");
      }
    } catch (err) {
      console.error(err);
      setAbError("Network error — try again");
    } finally {
      setAbLoading(false);
    }
  }

  return (
    <>
      <Header
        title="Success Predictor & Experiment Center"
        subtitle="Predict video success or A/B test ideas before publishing."
      />

      <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
        {/* Tabs */}
        <div className="flex gap-2 p-1 bg-gray-100 rounded-lg w-fit">
          <button
            onClick={() => setTab("predict")}
            className={cn(
              "px-4 py-2 rounded-md text-sm font-medium transition-all",
              tab === "predict"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            )}
          >
            Predict Success
          </button>
          <button
            onClick={() => setTab("ab-test")}
            className={cn(
              "px-4 py-2 rounded-md text-sm font-medium transition-all",
              tab === "ab-test"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            )}
          >
            A/B Test Simulator
          </button>
        </div>

        {tab === "predict" && (
          <div className="grid md:grid-cols-12 gap-8">
            <div className="md:col-span-4 space-y-4">
              <Card>
                <CardBody className="p-5 space-y-4">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Video Concept
                  </h3>
                  <Input
                    label="Core Topic"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. AI Tools 2026"
                  />
                  <Textarea
                    label="Proposed Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Best AI tools right now"
                    rows={2}
                  />
                  {predictError && (
                    <p className="text-sm text-red-600">{predictError}</p>
                  )}
                  <Button
                    onClick={runPrediction}
                    loading={loading}
                    disabled={!topic.trim() || !title.trim()}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Target className="w-4 h-4 mr-2" /> Predict Success
                  </Button>
                </CardBody>
              </Card>
            </div>

            <div className="md:col-span-8">
              {!loading && !result && (
                <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-200 h-full flex flex-col items-center justify-center">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
                    <Target className="w-6 h-6 text-blue-500" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Predict Before You Publish
                  </h3>
                  <p className="text-gray-500 text-sm max-w-sm mx-auto">
                    Enter your video topic to let AI estimate its growth
                    potential and provide one-click improvements.
                  </p>
                </div>
              )}

              {loading && (
                <div className="h-full bg-white rounded-xl border border-gray-200 animate-pulse min-h-[400px]" />
              )}

              {result && !loading && (
                <div className="space-y-6">
                  <Card className="overflow-hidden border-blue-100">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white flex justify-between items-center">
                      <div>
                        <h2 className="text-2xl font-bold mb-1">
                          Prediction Analysis Complete
                        </h2>
                        <div className="flex gap-2 items-center text-blue-100 text-sm">
                          <Badge
                            variant="blue"
                            className="bg-blue-500/30 text-white border-blue-400/30"
                          >
                            Confidence: {result.confidence}%
                          </Badge>
                          <span>{result.confidence_reason}</span>
                        </div>
                      </div>
                    </div>

                    <CardBody className="p-6 bg-white flex items-center justify-center gap-12">
                      <div className="text-center">
                        <ScoreRing score={result.current_score} size={96} />
                        <p className="text-sm font-medium text-gray-600 mt-2">
                          Current Prediction
                        </p>
                      </div>

                      <div className="flex flex-col items-center text-gray-400">
                        <ArrowRight className="w-8 h-8 text-blue-300" />
                        <span className="text-xs font-semibold text-blue-600 mt-1 uppercase tracking-wide">
                          AI Optimized
                        </span>
                      </div>

                      <div className="text-center">
                        <ScoreRing score={result.optimized_score} size={110} />
                        <p className="text-sm font-bold text-blue-600 mt-2">
                          Potential Score
                        </p>
                      </div>
                    </CardBody>
                  </Card>

                  <div className="grid md:grid-cols-2 gap-6">
                    <Card className="border-green-100 bg-green-50/30">
                      <CardBody className="p-5">
                        <h3 className="font-semibold text-green-800 text-sm mb-3 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4" /> Top Reasons to
                          Succeed
                        </h3>
                        <ul className="space-y-2">
                          {result.strengths.map((s: string, i: number) => (
                            <li
                              key={i}
                              className="text-sm text-gray-700 flex gap-2 items-start"
                            >
                              <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />{" "}
                              {s}
                            </li>
                          ))}
                        </ul>
                      </CardBody>
                    </Card>

                    <Card className="border-red-100 bg-red-50/30">
                      <CardBody className="p-5">
                        <h3 className="font-semibold text-red-800 text-sm mb-3 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4" /> Top Risks
                        </h3>
                        <ul className="space-y-2">
                          {result.risks.map((r: string, i: number) => (
                            <li
                              key={i}
                              className="text-sm text-gray-700 flex gap-2 items-start"
                            >
                              <Activity className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />{" "}
                              {r}
                            </li>
                          ))}
                        </ul>
                      </CardBody>
                    </Card>
                  </div>

                  <Card>
                    <CardBody className="p-5">
                      <h3 className="font-semibold text-gray-900 text-sm mb-4 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-blue-500" /> AI
                        Optimization Plan
                      </h3>

                      <div className="space-y-4">
                        {result.improvements.map((imp: any, i: number) => (
                          <div
                            key={i}
                            className="flex items-start justify-between p-4 bg-gray-50 rounded-lg border border-gray-100"
                          >
                            <div>
                              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                {imp.type}
                              </span>
                              <div className="mt-1">
                                {imp.old && (
                                  <p className="text-sm text-gray-400 line-through mb-1">
                                    {imp.old}
                                  </p>
                                )}
                                <p className="text-sm font-medium text-gray-900">
                                  {imp.new}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardBody>
                  </Card>
                </div>
              )}
            </div>
          </div>
        )}

        {/* A/B Test Simulator */}
        {tab === "ab-test" && (
          <div className="space-y-6">
            <Card>
              <CardBody className="p-6 md:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center shrink-0">
                    <ArrowRightLeft className="w-7 h-7 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-900 mb-1">
                      A/B Test Simulator
                    </h2>
                    <p className="text-gray-500 text-sm">
                      Compare Title A vs B (or thumbnail concepts). AI predicts
                      the winner, CTR potential, and confidence — before you
                      publish.
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 p-1 bg-gray-100 rounded-lg w-fit">
                  <button
                    type="button"
                    onClick={() => setAbMode("title")}
                    className={cn(
                      "px-3 py-1.5 rounded-md text-xs font-semibold transition-all",
                      abMode === "title"
                        ? "bg-white text-purple-700 shadow-sm"
                        : "text-gray-600"
                    )}
                  >
                    Titles
                  </button>
                  <button
                    type="button"
                    onClick={() => setAbMode("thumbnail")}
                    className={cn(
                      "px-3 py-1.5 rounded-md text-xs font-semibold transition-all",
                      abMode === "thumbnail"
                        ? "bg-white text-purple-700 shadow-sm"
                        : "text-gray-600"
                    )}
                  >
                    Thumbnail concepts
                  </button>
                </div>

                <Input
                  label="Topic (optional)"
                  value={abTopic}
                  onChange={(e) => setAbTopic(e.target.value)}
                  placeholder="e.g. Budget gaming PC build"
                />

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Option A
                    </label>
                    <Textarea
                      value={variantA}
                      onChange={(e) => setVariantA(e.target.value)}
                      placeholder={
                        abMode === "title"
                          ? "Paste Title A..."
                          : "Describe thumbnail A (layout, text, emotion)..."
                      }
                      rows={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Option B
                    </label>
                    <Textarea
                      value={variantB}
                      onChange={(e) => setVariantB(e.target.value)}
                      placeholder={
                        abMode === "title"
                          ? "Paste Title B..."
                          : "Describe thumbnail B (layout, text, emotion)..."
                      }
                      rows={4}
                    />
                  </div>
                </div>

                {abError && (
                  <p className="text-sm text-red-600 flex items-center gap-2">
                    <XCircle className="w-4 h-4" /> {abError}
                  </p>
                )}

                <Button
                  onClick={runABTest}
                  loading={abLoading}
                  disabled={!variantA.trim() || !variantB.trim()}
                  className="w-full sm:w-auto px-8 bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <ArrowRightLeft className="w-4 h-4 mr-2" />
                  Simulate A/B Test
                </Button>
              </CardBody>
            </Card>

            {abLoading && (
              <div className="h-64 bg-white rounded-xl border border-gray-200 animate-pulse" />
            )}

            {abResult && !abLoading && (
              <div className="space-y-6">
                {/* Winner banner */}
                <Card
                  className={cn(
                    "overflow-hidden border",
                    abResult.winner === "tie"
                      ? "border-amber-200"
                      : "border-purple-200"
                  )}
                >
                  <div
                    className={cn(
                      "p-6 text-white",
                      abResult.winner === "tie"
                        ? "bg-gradient-to-r from-amber-500 to-orange-500"
                        : "bg-gradient-to-r from-purple-600 to-indigo-600"
                    )}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-white/80 mb-1">
                          Predicted winner
                        </p>
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                          <Trophy className="w-6 h-6" />
                          {abResult.winner === "tie"
                            ? "Too close to call (tie)"
                            : `Option ${abResult.winner} wins`}
                        </h2>
                        <p className="text-sm text-white/90 mt-2 max-w-2xl">
                          {abResult.summary}
                        </p>
                      </div>
                      <Badge className="bg-white/20 text-white border-white/30 self-start">
                        Confidence {abResult.confidence}%
                      </Badge>
                    </div>
                  </div>

                  <CardBody className="p-6 grid md:grid-cols-2 gap-8">
                    <VariantCard
                      letter="A"
                      data={abResult.variant_a}
                      isWinner={abResult.winner === "A"}
                      isTie={abResult.winner === "tie"}
                    />
                    <VariantCard
                      letter="B"
                      data={abResult.variant_b}
                      isWinner={abResult.winner === "B"}
                      isTie={abResult.winner === "tie"}
                    />
                  </CardBody>
                </Card>

                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardBody className="p-5">
                      <h3 className="font-semibold text-gray-900 text-sm mb-3 flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-purple-600" />
                        Why this wins
                      </h3>
                      <ul className="space-y-2">
                        {(abResult.why_winner || []).map((r, i) => (
                          <li
                            key={i}
                            className="text-sm text-gray-700 flex gap-2 items-start"
                          >
                            <CheckCircle className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                            {r}
                          </li>
                        ))}
                      </ul>
                    </CardBody>
                  </Card>
                  <Card className="border-indigo-100 bg-indigo-50/40">
                    <CardBody className="p-5">
                      <h3 className="font-semibold text-indigo-900 text-sm mb-2 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Recommendation
                      </h3>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {abResult.recommendation}
                      </p>
                    </CardBody>
                  </Card>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

function VariantCard({
  letter,
  data,
  isWinner,
  isTie,
}: {
  letter: "A" | "B";
  data: ABResult["variant_a"];
  isWinner: boolean;
  isTie: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border p-5 space-y-4",
        isWinner && !isTie
          ? "border-purple-300 bg-purple-50/50 ring-1 ring-purple-200"
          : "border-gray-200 bg-white"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
            Option {letter}
          </p>
          <h3 className="font-semibold text-gray-900 mt-0.5">
            {data.label || `Option ${letter}`}
          </h3>
          {isWinner && !isTie && (
            <span className="inline-flex mt-1 text-[10px] font-bold uppercase bg-purple-600 text-white px-2 py-0.5 rounded-full">
              Winner
            </span>
          )}
        </div>
        <div className="text-center">
          <ScoreRing score={data.score} size={72} />
          <p className="text-[10px] text-gray-500 mt-1">Score</p>
        </div>
      </div>
      <p className="text-xs text-gray-500">
        Est. CTR:{" "}
        <span className="font-semibold text-gray-800">{data.estimated_ctr}</span>
      </p>
      <div>
        <p className="text-xs font-semibold text-green-700 mb-1">Strengths</p>
        <ul className="space-y-1">
          {(data.strengths || []).map((s, i) => (
            <li key={i} className="text-xs text-gray-600 flex gap-1.5">
              <CheckCircle className="w-3 h-3 text-green-500 shrink-0 mt-0.5" />
              {s}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <p className="text-xs font-semibold text-red-700 mb-1">Weaknesses</p>
        <ul className="space-y-1">
          {(data.weaknesses || []).map((s, i) => (
            <li key={i} className="text-xs text-gray-600 flex gap-1.5">
              <AlertTriangle className="w-3 h-3 text-red-400 shrink-0 mt-0.5" />
              {s}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
