"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, ChevronLeft, Clock, Hash, FileText, Copy, Check, RefreshCw } from "lucide-react";
import { useVideoEngineStore } from "@/lib/video-engine/state";
import { WizardProgress } from "@/components/video-engine/WizardProgress";
import { Script } from "@/domains/video-engine/types";
import { cn } from "@/lib/utils";

const SECTIONS = [
  { key: "intro",              label: "🎬 Intro" },
  { key: "main_content",       label: "📋 Main Content" },
  { key: "story_flow",         label: "📖 Story / Example" },
  { key: "engagement_points",  label: "💬 Engagement" },
  { key: "cta",                label: "🔔 Call to Action" },
  { key: "ending",             label: "👋 Outro" },
] as const;

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  function doCopy() {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button onClick={doCopy} className="flex items-center gap-1 text-xs text-gray-400 hover:text-blue-600 transition-colors">
      {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

export default function ScriptPage() {
  const router = useRouter();
  const { script, setScript, setStep, getContentContext } = useVideoEngineStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openSection, setOpenSection] = useState<string>("intro");

  useEffect(() => {
    const checkState = () => {
      const ctx = getContentContext();
      if (!ctx) {
        router.replace("/video-engine");
        return;
      }
      if (!script) fetchScript();
    };

    if (useVideoEngineStore.persist.hasHydrated()) {
      checkState();
    } else {
      const unsub = useVideoEngineStore.persist.onFinishHydration(() => checkState());
      return () => unsub();
    }
  }, []);

  async function fetchScript() {
    const ctx = getContentContext();
    if (!ctx) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/video-engine/script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ctx),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate script");
      setScript(data.data.script);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function getFullScript(s: Script): string {
    return SECTIONS.map(({ key, label }) =>
      `${label}\n${"─".repeat(40)}\n${(s as any)[key]?.content ?? ""}`
    ).join("\n\n");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <WizardProgress currentStep={7} />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">Step 7 of 8</p>
            <h1 className="text-2xl font-black text-gray-900">Your Video Script</h1>
            <p className="text-gray-500 mt-1">AI has written your complete, ready-to-read script.</p>
          </div>
          {script && (
            <div className="flex items-center gap-3 flex-shrink-0 mt-1">
              <div className="flex items-center gap-1.5 text-sm text-gray-500 bg-white border border-gray-200 rounded-lg px-3 py-1.5">
                <Clock className="w-3.5 h-3.5" /> {script.estimated_duration}
              </div>
              <div className="flex items-center gap-1.5 text-sm text-gray-500 bg-white border border-gray-200 rounded-lg px-3 py-1.5">
                <Hash className="w-3.5 h-3.5" /> {script.word_count.toLocaleString()} words
              </div>
            </div>
          )}
        </div>

        {/* Loading state */}
        {loading && (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <div className="w-12 h-12 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="font-semibold text-gray-900">Writing your script…</p>
            <p className="text-sm text-gray-500 mt-1">Using AI to craft a complete, tailored script for you.</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm flex items-center justify-between">
            <span>{error}</span>
            <button onClick={fetchScript} className="flex items-center gap-1 text-red-600 hover:text-red-800 font-medium">
              <RefreshCw className="w-4 h-4" /> Retry
            </button>
          </div>
        )}

        {/* Script accordion */}
        {!loading && script && (
          <div className="space-y-2">
            {/* Copy all */}
            <div className="flex justify-end mb-2">
              <CopyButton text={getFullScript(script)} />
            </div>

            {SECTIONS.map(({ key, label }) => {
              const section = (script as any)[key];
              const isOpen = openSection === key;
              return (
                <div key={key} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <button
                    onClick={() => setOpenSection(isOpen ? "" : key)}
                    className="w-full flex items-center justify-between px-5 py-3.5 text-left hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-semibold text-sm text-gray-800">{label}</span>
                    <div className="flex items-center gap-3">
                      {isOpen && <CopyButton text={section?.content ?? ""} />}
                      <ChevronRight className={cn("w-4 h-4 text-gray-400 transition-transform duration-200", isOpen && "rotate-90")} />
                    </div>
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 border-t border-gray-100">
                      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                        {section?.content ?? "No content generated."}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {!loading && script && (
          <div className="sticky bottom-0 mt-6 flex items-center justify-between bg-white/90 backdrop-blur border border-gray-200 rounded-xl px-5 py-3 shadow-lg">
            <div className="flex items-center gap-2">
              <button onClick={() => router.back()} className="flex items-center gap-1 text-gray-500 hover:text-gray-700 text-sm">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <button onClick={fetchScript} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500" title="Regenerate script">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={() => { setStep(7); router.push("/video-engine/kit"); }}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors"
            >
              Generate Full Kit <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
