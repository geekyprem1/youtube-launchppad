"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Activity, PlaySquare, Smartphone, Zap, Loader2, Image as ImageIcon, Copy, Download, RefreshCw, Pencil, CheckCircle2 } from "lucide-react";

const CATEGORIES = [
  "Technology", "Finance", "Business", "Gaming", "Education", 
  "Health", "Fitness", "Travel", "Food", "AI", "Motivation", 
  "Horror", "Spiritual", "News", "Entertainment", "Podcast", "Kids", "Vlogs"
];

const MOODS = [
  "Viral", "Cinematic", "Dramatic", "Luxury", "Dark", "Bright", 
  "Minimal", "Emotional", "Professional", "Modern", "Mystery", 
  "Horror", "Futuristic", "High Energy"
];

const LOADING_MESSAGES = [
  "Understanding your idea...",
  "Optimizing the prompt...",
  "Choosing the best composition...",
  "Applying cinematic lighting...",
  "Enhancing visual storytelling...",
  "Generating thumbnail...",
  "Finalizing high-quality image..."
];

export default function ThumbnailEnginePage() {
  const [videoType, setVideoType] = useState<"long" | "shorts">("long");
  const [inputType, setInputType] = useState<"topic" | "title" | "prompt">("topic");
  const [input, setInput] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [mood, setMood] = useState(MOODS[0]);
  
  const [loading, setLoading] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  const handleGenerate = async () => {
    if (!input.trim()) return;
    
    setLoading(true);
    setResult(null);
    setError("");
    setLoadingMessageIndex(0);

    const messageInterval = setInterval(() => {
      setLoadingMessageIndex(prev => (prev < LOADING_MESSAGES.length - 1 ? prev + 1 : prev));
    }, 1500);

    try {
      const res = await fetch("/api/thumbnail-engine/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoType, inputType, input, category, mood }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");

      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate thumbnail");
    } finally {
      clearInterval(messageInterval);
      setLoading(false);
    }
  };

  const handleCopyPrompt = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.optimizedPrompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleDownload = async () => {
    if (!result?.imageUrl) return;
    try {
      // Fetch the image and create a blob to trigger download
      const response = await fetch(result.imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `thumbnail-${videoType}-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Failed to download image", e);
      window.open(result.imageUrl, "_blank"); // Fallback to opening in new tab
    }
  };

  return (
    <>
      <Header 
        title="Thumbnail Pro Engine" 
        subtitle="Generate premium YouTube thumbnails optimized for CTR using AI." 
      />
      
      <div className="p-8 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Input Panel (Left Column) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
            
            {/* Video Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">Video Format</label>
              <div className="flex gap-2 p-1 bg-gray-50 rounded-xl">
                <button
                  onClick={() => setVideoType("long")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-medium text-sm transition-all ${
                    videoType === "long" ? "bg-white text-gray-900 shadow-sm ring-1 ring-gray-200" : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  <PlaySquare className="w-4 h-4" /> 16:9
                </button>
                <button
                  onClick={() => setVideoType("shorts")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-medium text-sm transition-all ${
                    videoType === "shorts" ? "bg-white text-gray-900 shadow-sm ring-1 ring-gray-200" : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  <Smartphone className="w-4 h-4" /> 9:16
                </button>
              </div>
            </div>

            {/* Input Type & Input */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-semibold text-gray-900">What is the video about?</label>
                <select 
                  value={inputType}
                  onChange={(e) => setInputType(e.target.value as any)}
                  className="text-xs bg-gray-50 border border-gray-200 rounded-md px-2 py-1 outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="topic">Topic</option>
                  <option value="title">Title</option>
                  <option value="prompt">Custom Prompt</option>
                </select>
              </div>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  inputType === "topic" ? "E.g., Best AI Tools 2026" :
                  inputType === "title" ? "E.g., Top 10 AI Tools Every Creator Must Know" :
                  "Describe your exact thumbnail idea..."
                }
                className="w-full h-24 px-4 py-3 bg-gray-50 border border-gray-200 focus:border-blue-500 focus:bg-white rounded-xl text-sm transition-all outline-none resize-none"
              />
            </div>

            {/* Category & Mood */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Category</label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Mood / Style</label>
                <select 
                  value={mood}
                  onChange={(e) => setMood(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {MOODS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>

            <Button 
              onClick={handleGenerate} 
              disabled={!input.trim() || loading} 
              className="w-full py-6 text-base rounded-xl bg-blue-600 hover:bg-blue-700 shadow-md transition-all active:scale-95"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImageIcon className="w-5 h-5 mr-2" />}
              {loading ? "Generating..." : "Generate Thumbnail"}
            </Button>
            
            {error && (
              <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm font-medium text-center">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Results Panel (Right Column) */}
        <div className="lg:col-span-8">
          
          {loading && (
            <div className="h-full min-h-[500px] flex flex-col items-center justify-center bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center space-y-6">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-75" />
                <div className="relative flex items-center justify-center w-full h-full bg-blue-600 text-white rounded-full">
                  <Activity className="w-8 h-8 animate-pulse" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">AI is working...</h3>
                <p className="text-blue-600 font-medium animate-pulse">
                  {LOADING_MESSAGES[loadingMessageIndex]}
                </p>
              </div>
            </div>
          )}

          {!loading && !result && (
            <div className="h-full min-h-[500px] flex flex-col items-center justify-center bg-gray-50/50 rounded-2xl border border-gray-200 border-dashed text-gray-400 p-8 text-center">
              <ImageIcon className="w-16 h-16 mb-4 opacity-50" />
              <h3 className="text-lg font-semibold text-gray-700 mb-1">No Thumbnail Generated</h3>
              <p className="text-sm max-w-sm">Fill out the details on the left and click generate to create your AI optimized thumbnail.</p>
            </div>
          )}

          {!loading && result && (
            <div className="space-y-6">
              
              {/* Image Preview Card */}
              <Card className="overflow-hidden bg-gray-900 border-0 shadow-xl">
                <div className="p-6 flex flex-col items-center">
                  <div className={`relative rounded-lg overflow-hidden border border-gray-800 shadow-2xl ${videoType === "long" ? "w-full aspect-[16/9]" : "w-[320px] aspect-[9/16]"}`}>
                    <img 
                      src={result.imageUrl} 
                      alt="Generated Thumbnail" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex gap-3 mt-6">
                    <Button onClick={handleDownload} className="bg-white text-gray-900 hover:bg-gray-100 rounded-full px-6">
                      <Download className="w-4 h-4 mr-2" /> Download
                    </Button>
                    <Button variant="secondary" onClick={handleGenerate} className="bg-gray-800 text-white hover:bg-gray-700 border-0 rounded-full px-6">
                      <RefreshCw className="w-4 h-4 mr-2" /> Regenerate
                    </Button>
                  </div>
                </div>
              </Card>

              <div className="grid grid-cols-1 gap-6">
                {/* Prompt Card */}
                <Card className="shadow-sm">
                  <CardBody className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-900 text-sm">Optimized Prompt</h4>
                      <div className="flex gap-2">
                        <button onClick={handleCopyPrompt} className="text-gray-400 hover:text-blue-600 transition-colors p-1">
                          {copiedPrompt ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                        </button>
                        <button onClick={() => { setInputType("prompt"); setInput(result.optimizedPrompt); }} className="text-gray-400 hover:text-blue-600 transition-colors p-1">
                          <Pencil className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-sm text-gray-600 leading-relaxed max-h-[160px] overflow-y-auto">
                      {result.optimizedPrompt}
                    </div>
                  </CardBody>
                </Card>
              </div>

            </div>
          )}

        </div>
      </div>
    </>
  );
}
