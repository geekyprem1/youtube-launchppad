"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { Activity, PlaySquare, Smartphone, Zap, Loader2 } from "lucide-react";
import { ToolkitResultsView } from "@/components/toolkit-engine/ToolkitResultsView";
import type { ToolkitResponse } from "@/domains/toolkit-engine/types";

const loadingMessages = [
  "Understanding your topic...",
  "Optimizing for YouTube SEO...",
  "Crafting high-CTR titles...",
  "Writing an optimized description...",
  "Finding the best keywords...",
  "Generating hashtags...",
  "Finalizing your Toolkit..."
];

export default function ToolkitEnginePage() {
  const [videoType, setVideoType] = useState<"long" | "shorts">("long");
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [result, setResult] = useState<ToolkitResponse | null>(null);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    
    setLoading(true);
    setResult(null);
    setError("");
    setLoadingMessageIndex(0);

    // Simulate loading messages progress
    const messageInterval = setInterval(() => {
      setLoadingMessageIndex(prev => (prev < loadingMessages.length - 1 ? prev + 1 : prev));
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

  return (
    <>
      <Header 
        title="Toolkit Engine" 
        subtitle="Generate optimized YouTube publishing assets in seconds." 
      />
      
      <div className="p-8 max-w-5xl mx-auto space-y-8">
        
        {/* Input Section */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
          <div className="flex gap-4 p-1.5 bg-gray-50 rounded-xl max-w-md mx-auto">
            <button
              onClick={() => setVideoType("long")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium text-sm transition-all ${
                videoType === "long" 
                  ? "bg-white text-gray-900 shadow-sm ring-1 ring-gray-200" 
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              <PlaySquare className="w-4 h-4" /> Long Video
            </button>
            <button
              onClick={() => setVideoType("shorts")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium text-sm transition-all ${
                videoType === "shorts" 
                  ? "bg-white text-gray-900 shadow-sm ring-1 ring-gray-200" 
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              <Smartphone className="w-4 h-4" /> YouTube Shorts
            </button>
          </div>

          <div className="relative">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
              placeholder="E.g., Best AI Tools 2024..."
              className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-xl text-lg transition-all outline-none"
            />
          </div>

          <div className="flex justify-center">
            <Button 
              onClick={handleGenerate} 
              disabled={!topic.trim() || loading} 
              className="px-8 py-4 text-base rounded-xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95"
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

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 space-y-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-75" />
              <div className="relative flex items-center justify-center w-full h-full bg-blue-600 text-white rounded-full">
                <Activity className="w-8 h-8 animate-pulse" />
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">AI is working...</h3>
              <p className="text-gray-500 font-medium animate-pulse">
                {loadingMessages[loadingMessageIndex]}
              </p>
            </div>
          </div>
        )}

        {/* Results */}
        {!loading && result && (
          <ToolkitResultsView 
            initialResult={result} 
            topic={topic} 
            videoType={videoType} 
          />
        )}
        
      </div>
    </>
  );
}
