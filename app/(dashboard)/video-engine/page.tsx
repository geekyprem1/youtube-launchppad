"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Youtube, Hash, ArrowRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useVideoEngineStore } from "@/lib/video-engine/state";
import { WizardProgress } from "@/components/video-engine/WizardProgress";
import Link from "next/link";

export default function VideoEnginePage() {
  const router = useRouter();
  const { setInput, setStep } = useVideoEngineStore();

  const [activeTab, setActiveTab] = useState<"keyword" | "channel">("keyword");
  const [keyword, setKeyword] = useState("");
  const [channelUrl, setChannelUrl] = useState("");

  const isValid = activeTab === "keyword"
    ? keyword.trim().length >= 3
    : channelUrl.trim().length >= 3;

  function handleNext() {
    if (!isValid) return;
    if (activeTab === "keyword") {
      setInput("keyword", keyword.trim());
    } else {
      setInput("channel", channelUrl.trim());
    }
    setStep(0);
    router.push("/video-engine/topics");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 flex flex-col">
      <WizardProgress currentStep={0} />

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl">

          {/* Hero */}
          <div className="text-center mb-10 relative">
            <div className="absolute right-0 top-0">
              <Link href="/video-engine/history" className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/10">
                View History <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-sm font-medium mb-6 mt-4 sm:mt-0">
              <Sparkles className="w-4 h-4" />
              AI Video Engine
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 leading-tight">
              From Idea to Full
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400"> Video Kit</span>
            </h1>
            <p className="text-gray-400 text-lg">
              Topic → Script → Thumbnail → Title → Description → Hashtags — all in one AI-powered flow.
            </p>
          </div>

          {/* Card */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 sm:p-8">

            {/* Tab selector */}
            <div className="flex rounded-xl bg-white/5 p-1 mb-6 gap-1">
              {[
                { id: "keyword" as const, icon: Hash, label: "Enter a Topic" },
                { id: "channel" as const, icon: Youtube, label: "Paste Channel URL" },
              ].map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === id
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-400 hover:text-gray-200"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>

            {/* Input area */}
            {activeTab === "keyword" ? (
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-300">
                  What topic do you want to make a video about?
                </label>
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleNext()}
                  placeholder="e.g. AI Tools, Passive Income, How to Grow on YouTube..."
                  className="w-full px-4 py-3.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  autoFocus
                />
                <div className="flex flex-wrap gap-2">
                  {["AI Tools", "Passive Income", "YouTube Growth", "Fitness Tips", "Stock Market"].map((s) => (
                    <button
                      key={s}
                      onClick={() => setKeyword(s)}
                      className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-gray-200 text-xs transition-all"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-300">
                  Paste your YouTube channel URL or handle
                </label>
                <input
                  type="text"
                  value={channelUrl}
                  onChange={(e) => setChannelUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleNext()}
                  placeholder="e.g. https://youtube.com/@YourChannel or @YourHandle"
                  className="w-full px-4 py-3.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  autoFocus
                />
                <div className="flex items-start gap-3 p-3.5 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                  <Sparkles className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-300">
                    AI will analyze your channel's niche, existing videos, and audience to generate hyper-personalized video ideas.
                  </p>
                </div>
              </div>
            )}

            {/* CTA */}
            <button
              onClick={handleNext}
              disabled={!isValid}
              className="mt-6 w-full flex items-center justify-center gap-3 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-base transition-all duration-200 shadow-lg shadow-blue-900/40 group"
            >
              <Zap className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              Generate Video Ideas
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Stats strip */}
          <div className="flex justify-center gap-8 mt-8 text-center">
            {[
              { label: "Steps to Full Kit", value: "8" },
              { label: "AI Sub-tasks", value: "11" },
              { label: "Export Formats", value: "5" },
            ].map(({ label, value }) => (
              <div key={label}>
                <div className="text-2xl font-black text-white">{value}</div>
                <div className="text-xs text-gray-500">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
