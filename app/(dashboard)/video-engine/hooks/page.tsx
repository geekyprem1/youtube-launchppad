"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, ChevronLeft, RefreshCw, Zap, BookOpen, HelpCircle, AlertTriangle, TrendingUp } from "lucide-react";
import { useVideoEngineStore } from "@/lib/video-engine/state";
import { WizardProgress } from "@/components/video-engine/WizardProgress";
import { Hook, HookType } from "@/domains/video-engine/types";
import { cn } from "@/lib/utils";

const HOOK_ICONS: Record<HookType, React.ReactNode> = {
  "Curiosity":      <Zap className="w-4 h-4" />,
  "Story":          <BookOpen className="w-4 h-4" />,
  "Shocking Fact":  <AlertTriangle className="w-4 h-4" />,
  "Question":       <HelpCircle className="w-4 h-4" />,
  "FOMO":           <TrendingUp className="w-4 h-4" />,
};

const HOOK_COLORS: Record<HookType, string> = {
  "Curiosity":     "bg-blue-50 border-blue-200 text-blue-700",
  "Story":         "bg-purple-50 border-purple-200 text-purple-700",
  "Shocking Fact": "bg-red-50 border-red-200 text-red-700",
  "Question":      "bg-amber-50 border-amber-200 text-amber-700",
  "FOMO":          "bg-green-50 border-green-200 text-green-700",
};

function HookSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 animate-pulse">
      <div className="h-3 bg-gray-100 rounded w-24 mb-3" />
      <div className="h-5 bg-gray-100 rounded w-full mb-2" />
      <div className="h-5 bg-gray-100 rounded w-3/4 mb-4" />
      <div className="h-1.5 bg-gray-100 rounded-full w-full" />
    </div>
  );
}

export default function HooksPage() {
  const router = useRouter();
  const { allHooks, setHooks, setSelectedHook, setStep, getContentContext, tone, selectedTopic, videoType, audienceLevel, audienceAge } = useVideoEngineStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Hook | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const checkState = () => {
      setHydrated(true);
      const ctx = getContentContext();
      if (!ctx) {
        router.replace("/video-engine");
        return;
      }
      if (allHooks.length === 0) fetchHooks();
    };

    if (useVideoEngineStore.persist.hasHydrated()) {
      checkState();
    } else {
      const unsub = useVideoEngineStore.persist.onFinishHydration(() => checkState());
      return () => unsub();
    }
  }, []);

  async function fetchHooks() {
    const ctx = getContentContext();
    if (!ctx) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/video-engine/hooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ctx),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate hooks");
      setHooks(data.data.hooks);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function handleSelect(hook: Hook) {
    setSelected(hook);
    setSelectedHook(hook);
  }

  function handleNext() {
    if (!selected) return;
    setStep(6);
    router.push("/video-engine/script");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <WizardProgress currentStep={6} />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">Step 6 of 8</p>
          <h1 className="text-2xl font-black text-gray-900">Pick Your Opening Hook</h1>
          <p className="text-gray-500 mt-1">Your hook is the first thing viewers hear. It determines whether they stay or leave.</p>
        </div>

        {loading && <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <HookSkeleton key={i} />)}</div>}

        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm flex items-center justify-between">
            <span>{error}</span>
            <button onClick={fetchHooks} className="flex items-center gap-1 text-red-600 hover:text-red-800 font-medium">
              <RefreshCw className="w-4 h-4" /> Retry
            </button>
          </div>
        )}

        {!loading && allHooks.length > 0 && (
          <div className="space-y-3">
            {allHooks.map((hook) => {
              const isSelected = selected?.id === hook.id;
              return (
                <button
                  key={hook.id}
                  onClick={() => handleSelect(hook)}
                  className={cn(
                    "w-full text-left rounded-xl border-2 p-5 transition-all duration-200 hover:shadow-md",
                    isSelected
                      ? "border-blue-600 bg-blue-50 shadow-md shadow-blue-100"
                      : "border-gray-200 bg-white hover:border-blue-300"
                  )}
                >
                  {/* Hook type badge */}
                  <div className={cn(
                    "inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border mb-3",
                    HOOK_COLORS[hook.type]
                  )}>
                    {HOOK_ICONS[hook.type]}
                    {hook.type}
                  </div>

                  {/* Hook text */}
                  <p className={cn(
                    "text-base font-semibold leading-snug mb-4",
                    isSelected ? "text-blue-900" : "text-gray-900"
                  )}>
                    "{hook.text}"
                  </p>

                  {/* Confidence bar */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-700",
                          hook.confidence_score >= 85 ? "bg-green-500" :
                          hook.confidence_score >= 70 ? "bg-blue-500" : "bg-yellow-500"
                        )}
                        style={{ width: `${hook.confidence_score}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-gray-500 w-10 text-right">
                      {hook.confidence_score}%
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {!loading && allHooks.length > 0 && (
          <div className="sticky bottom-0 mt-6 flex items-center justify-between bg-white/90 backdrop-blur border border-gray-200 rounded-xl px-5 py-3 shadow-lg">
            <div className="flex items-center gap-2">
              <button onClick={() => router.back()} className="flex items-center gap-1 text-gray-500 hover:text-gray-700 text-sm">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <button onClick={fetchHooks} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500" title="Regenerate hooks">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={handleNext}
              disabled={!selected}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors"
            >
              Generate Script <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
