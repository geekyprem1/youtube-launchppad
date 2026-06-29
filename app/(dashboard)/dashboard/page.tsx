"use client";

import { useState, useEffect } from "react";
import { 
  Activity, ArrowRight, Youtube, Sparkles
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import type { ChannelReport } from "@/domains/channel-engine/types";
import { ChannelReportView } from "@/components/channel-engine/ChannelReportView";
import Link from "next/link";

const LOADING_MESSAGES = [
  "Connecting to YouTube...",
  "Fetching Channel Information...",
  "Analyzing Branding...",
  "Reviewing Thumbnails...",
  "Evaluating Titles...",
  "Checking SEO...",
  "Measuring Upload Consistency...",
  "Detecting Audience Signals...",
  "Finding Content Gaps...",
  "Calculating CTR Potential...",
  "Generating Growth Strategy...",
  "Preparing Final Report...",
];

export default function ChannelEnginePage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [report, setReport] = useState<ChannelReport | null>(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"findings" | "strategy" | "metrics">("findings");

  // Cycle loading messages
  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setLoadingMsgIdx((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [loading]);

  async function handleAnalyze() {
    if (!url.trim()) return;
    setLoading(true);
    setError("");
    setLoadingMsgIdx(0);

    try {
      const res = await fetch("/api/channel-engine/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channelUrl: url }),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Analysis failed");
      setReport(data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Calculate color based on score
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500 bg-green-50";
    if (score >= 60) return "text-yellow-500 bg-yellow-50";
    return "text-red-500 bg-red-50";
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header title="Channel Engine" subtitle="AI-powered YouTube channel auditing system." />
      
      <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full flex-1">
        
        {/* INPUT STATE */}
        {!loading && !report && (
          <div className="max-w-2xl mx-auto mt-12">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                AI Smart Audit
              </div>
              <h1 className="text-3xl font-black text-gray-900 mb-3">Audit Your Channel</h1>
              <p className="text-gray-500 text-sm">
                Paste your YouTube Channel URL or @handle to discover what's stopping your growth.
              </p>
            </div>

            <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-200 flex items-center">
              <div className="pl-4 text-gray-400"><Youtube className="w-5 h-5" /></div>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
                placeholder="e.g. https://youtube.com/@AliAbdaal"
                className="w-full px-4 py-3 bg-transparent border-none focus:outline-none focus:ring-0 text-sm"
              />
              <button
                onClick={handleAnalyze}
                disabled={!url.trim()}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors flex items-center gap-2"
              >
                Analyze <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {error && (
              <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-xl text-sm text-center border border-red-100">
                {error}
              </div>
            )}
          </div>
        )}

        {/* LOADING STATE */}
        {loading && (
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <div className="relative w-24 h-24 mb-8">
              <div className="absolute inset-0 border-4 border-blue-100 rounded-full animate-ping opacity-75"></div>
              <div className="absolute inset-2 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Activity className="w-8 h-8 text-blue-600 animate-pulse" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Analyzing Channel</h2>
            <p className="text-blue-600 font-medium animate-pulse">{LOADING_MESSAGES[loadingMsgIdx]}</p>
          </div>
        )}

        {/* REPORT DASHBOARD */}
        {report && !loading && (
          <ChannelReportView 
            report={report} 
            onRerun={() => setReport(null)} 
          />
        )}
      </div>
    </div>
  );
}
