"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TrendingUp, Eye, Zap, BarChart2, ChevronRight, RefreshCw } from "lucide-react";
import { useVideoEngineStore } from "@/lib/video-engine/state";
import { WizardProgress } from "@/components/video-engine/WizardProgress";
import { Topic } from "@/domains/video-engine/types";
import { cn } from "@/lib/utils";

const TREND_COLORS = {
  Viral: "bg-red-100 text-red-700 border-red-200",
  High: "bg-orange-100 text-orange-700 border-orange-200",
  Medium: "bg-blue-100 text-blue-700 border-blue-200",
  Low: "bg-gray-100 text-gray-600 border-gray-200",
};

const DIFFICULTY_COLORS = {
  Easy: "text-green-600",
  Medium: "text-yellow-600",
  Hard: "text-red-600",
};

function TopicCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 animate-pulse">
      <div className="flex gap-4">
        <div className="w-14 h-14 rounded-xl bg-gray-100 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-100 rounded w-3/4" />
          <div className="h-3 bg-gray-100 rounded w-full" />
          <div className="h-3 bg-gray-100 rounded w-1/2" />
        </div>
      </div>
    </div>
  );
}

export default function TopicsPage() {
  const router = useRouter();
  const { inputType, rawInput, allTopics, setTopics, setSelectedTopic, setStep, currentStep } = useVideoEngineStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Topic | null>(null);

  useEffect(() => {
    if (!rawInput) { router.replace("/video-engine"); return; }
    if (allTopics.length === 0) fetchTopics();
  }, []);

  async function fetchTopics() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/video-engine/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input_type: inputType, keyword: rawInput }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate topics");
      setTopics(data.data.topics);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function handleSelect(topic: Topic) {
    setSelected(topic);
    setSelectedTopic(topic);
  }

  function handleNext() {
    if (!selected) return;
    setStep(1);
    router.push("/video-engine/language");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <WizardProgress currentStep={1} />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">Step 1 of 8</p>
          <h1 className="text-2xl font-black text-gray-900">Choose Your Video Topic</h1>
          <p className="text-gray-500 mt-1">AI has generated {allTopics.length || 6} high-potential ideas for <span className="font-medium text-gray-700">"{rawInput}"</span></p>
        </div>

        {/* Loading skeletons */}
        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => <TopicCardSkeleton key={i} />)}
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm flex items-center justify-between">
            <span>{error}</span>
            <button onClick={fetchTopics} className="flex items-center gap-1 text-red-600 hover:text-red-800 font-medium">
              <RefreshCw className="w-4 h-4" /> Retry
            </button>
          </div>
        )}

        {/* Topic cards */}
        {!loading && allTopics.length > 0 && (
          <div className="space-y-3">
            {allTopics.map((topic) => {
              const isSelected = selected?.id === topic.id;
              return (
                <button
                  key={topic.id}
                  onClick={() => handleSelect(topic)}
                  className={cn(
                    "w-full text-left bg-white rounded-xl border-2 p-5 transition-all duration-200 hover:shadow-md group",
                    isSelected
                      ? "border-blue-600 shadow-md shadow-blue-100"
                      : "border-gray-200 hover:border-blue-300"
                  )}
                >
                  <div className="flex gap-4">
                    {/* Score ring */}
                    <div className={cn(
                      "w-14 h-14 rounded-xl flex flex-col items-center justify-center flex-shrink-0 transition-colors",
                      isSelected ? "bg-blue-600" : "bg-gray-100 group-hover:bg-blue-50"
                    )}>
                      <span className={cn("text-xl font-black", isSelected ? "text-white" : "text-blue-600")}>
                        {topic.confidence_score}
                      </span>
                      <span className={cn("text-[9px] font-bold uppercase tracking-wide", isSelected ? "text-blue-200" : "text-gray-400")}>
                        score
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className={cn("font-bold text-sm leading-snug", isSelected ? "text-blue-700" : "text-gray-900")}>
                          {topic.topic}
                        </h3>
                        {isSelected && (
                          <ChevronRight className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        )}
                      </div>

                      <p className="text-xs text-gray-500 mt-1 mb-3 line-clamp-2">{topic.reason}</p>

                      <div className="flex flex-wrap gap-2">
                        <span className={cn("inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border", TREND_COLORS[topic.trend_score])}>
                          <TrendingUp className="w-3 h-3" /> {topic.trend_score}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                          <Eye className="w-3 h-3" /> {topic.views_potential}
                        </span>
                        <span className={cn("inline-flex items-center gap-1 text-[10px] font-medium", DIFFICULTY_COLORS[topic.difficulty_score])}>
                          <BarChart2 className="w-3 h-3" /> {topic.difficulty_score}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Bottom bar */}
        {!loading && allTopics.length > 0 && (
          <div className="sticky bottom-0 mt-6 flex items-center justify-between bg-white/90 backdrop-blur border border-gray-200 rounded-xl px-5 py-3 shadow-lg">
            <div>
              {selected ? (
                <p className="text-sm font-medium text-gray-700">
                  Selected: <span className="text-blue-700">"{selected.topic}"</span>
                </p>
              ) : (
                <p className="text-sm text-gray-400">Select a topic to continue</p>
              )}
            </div>
            <div className="flex gap-2">
              <button onClick={fetchTopics} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors" title="Regenerate">
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={handleNext}
                disabled={!selected}
                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors"
              >
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
