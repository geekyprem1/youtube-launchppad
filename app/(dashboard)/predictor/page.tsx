"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { 
  CheckCircle, TrendingUp, Target, Activity, 
  AlertTriangle, Sparkles, ArrowRight, ArrowRightLeft 
} from "lucide-react";
import { cn, scoreBarColor } from "@/lib/utils";

export default function PredictorPage() {
  const [tab, setTab] = useState<"predict" | "ab-test">("predict");
  const [topic, setTopic] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  async function runPrediction() {
    if (!topic.trim() || !title.trim()) return;
    setLoading(true);
    setResult(null);
    
    try {
      const res = await fetch("/api/predictor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, title }),
      });
      const data = await res.json();
      
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
          improvements: data.analysis?.improvements || []
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Header title="Success Predictor & Experiment Center" subtitle="Predict video success or A/B test ideas before publishing." />
      
      <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
        
        {/* Tabs */}
        <div className="flex gap-2 p-1 bg-gray-100 rounded-lg w-fit">
          <button 
            onClick={() => setTab("predict")}
            className={cn("px-4 py-2 rounded-md text-sm font-medium transition-all", tab === "predict" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900")}
          >
            Predict Success
          </button>
          <button 
            onClick={() => setTab("ab-test")}
            className={cn("px-4 py-2 rounded-md text-sm font-medium transition-all", tab === "ab-test" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900")}
          >
            A/B Test Simulator
          </button>
        </div>

        {tab === "predict" && (
          <div className="grid md:grid-cols-12 gap-8">
            {/* Input Form */}
            <div className="md:col-span-4 space-y-4">
              <Card>
                <CardBody className="p-5 space-y-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Video Concept</h3>
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

            {/* Results */}
            <div className="md:col-span-8">
              {!loading && !result && (
                <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-200 h-full flex flex-col items-center justify-center">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
                    <Target className="w-6 h-6 text-blue-500" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">Predict Before You Publish</h3>
                  <p className="text-gray-500 text-sm max-w-sm mx-auto">
                    Enter your video topic to let AI estimate its growth potential and provide one-click improvements.
                  </p>
                </div>
              )}

              {loading && (
                <div className="h-full bg-white rounded-xl border border-gray-200 animate-pulse min-h-[400px]" />
              )}

              {result && !loading && (
                <div className="space-y-6">
                  {/* Hero Score (Before/After) */}
                  <Card className="overflow-hidden border-blue-100">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white flex justify-between items-center">
                      <div>
                        <h2 className="text-2xl font-bold mb-1">Prediction Analysis Complete</h2>
                        <div className="flex gap-2 items-center text-blue-100 text-sm">
                          <Badge variant="blue" className="bg-blue-500/30 text-white border-blue-400/30">
                            Confidence: {result.confidence}%
                          </Badge>
                          <span>{result.confidence_reason}</span>
                        </div>
                      </div>
                    </div>
                    
                    <CardBody className="p-6 bg-white flex items-center justify-center gap-12">
                      <div className="text-center">
                        <ScoreRing score={result.current_score} size={96} />
                        <p className="text-sm font-medium text-gray-600 mt-2">Current Prediction</p>
                      </div>
                      
                      <div className="flex flex-col items-center text-gray-400">
                        <ArrowRight className="w-8 h-8 text-blue-300" />
                        <span className="text-xs font-semibold text-blue-600 mt-1 uppercase tracking-wide">AI Optimized</span>
                      </div>
                      
                      <div className="text-center">
                        <ScoreRing score={result.optimized_score} size={110} />
                        <p className="text-sm font-bold text-blue-600 mt-2">Potential Score</p>
                      </div>
                    </CardBody>
                  </Card>

                  {/* Why it might fail / succeed */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <Card className="border-green-100 bg-green-50/30">
                      <CardBody className="p-5">
                        <h3 className="font-semibold text-green-800 text-sm mb-3 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4" /> Top 3 Reasons to Succeed
                        </h3>
                        <ul className="space-y-2">
                          {result.strengths.map((s: string, i: number) => (
                            <li key={i} className="text-sm text-gray-700 flex gap-2 items-start">
                              <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" /> {s}
                            </li>
                          ))}
                        </ul>
                      </CardBody>
                    </Card>
                    
                    <Card className="border-red-100 bg-red-50/30">
                      <CardBody className="p-5">
                        <h3 className="font-semibold text-red-800 text-sm mb-3 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4" /> Top 3 Reasons to Fail
                        </h3>
                        <ul className="space-y-2">
                          {result.risks.map((r: string, i: number) => (
                            <li key={i} className="text-sm text-gray-700 flex gap-2 items-start">
                              <Activity className="w-4 h-4 text-red-500 shrink-0 mt-0.5" /> {r}
                            </li>
                          ))}
                        </ul>
                      </CardBody>
                    </Card>
                  </div>

                  {/* 1-Click Fixes */}
                  <Card>
                    <CardBody className="p-5">
                      <h3 className="font-semibold text-gray-900 text-sm mb-4 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-blue-500" /> AI Optimization Plan
                      </h3>
                      
                      <div className="space-y-4">
                        {result.improvements.map((imp: any, i: number) => (
                          <div key={i} className="flex items-start justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                            <div>
                              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{imp.type}</span>
                              <div className="mt-1">
                                {imp.old && <p className="text-sm text-gray-400 line-through mb-1">{imp.old}</p>}
                                <p className="text-sm font-medium text-gray-900">{imp.new}</p>
                              </div>
                            </div>
                            <Button size="sm" variant="secondary" className="shrink-0 ml-4">
                              Apply Fix
                            </Button>
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
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardBody className="p-8 text-center space-y-6">
                <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-2">
                  <ArrowRightLeft className="w-8 h-8 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">A/B Test Simulator</h2>
                  <p className="text-gray-500">Test Title A vs Title B, or Thumbnail A vs Thumbnail B. AI will predict the winner and provide its confidence level.</p>
                </div>
                
                <div className="grid grid-cols-2 gap-8 mt-8">
                  <div className="space-y-4 text-left">
                    <h3 className="font-semibold text-gray-700 text-sm">Option A</h3>
                    <Textarea placeholder="Paste Title A..." rows={3} />
                  </div>
                  <div className="space-y-4 text-left">
                    <h3 className="font-semibold text-gray-700 text-sm">Option B</h3>
                    <Textarea placeholder="Paste Title B..." rows={3} />
                  </div>
                </div>
                
                <div className="pt-6">
                  <Button className="px-8 bg-purple-600 hover:bg-purple-700 text-white">Simulate A/B Test</Button>
                </div>
              </CardBody>
            </Card>
          </div>
        )}
      </div>
    </>
  );
}
