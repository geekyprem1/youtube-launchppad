"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { createClient } from "@/lib/supabase/client";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, PlaySquare, Smartphone, Loader2, Download, Copy, CheckCircle2, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

export default function ThumbnailHistoryDetail({ params }: { params: { id: string } }) {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchDetail();
  }, []);

  async function fetchDetail() {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { data } = await supabase
        .from("thumbnail_engine_history")
        .select("*")
        .eq("id", params.id)
        .eq("user_id", user.id)
        .single();
      
      if (data) setResult(data);
    }
    setLoading(false);
  }

  const handleCopyPrompt = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.optimized_prompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleDownload = async () => {
    if (!result?.image_url) return;
    try {
      const response = await fetch(result.image_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `thumbnail-${result.video_type}-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Failed to download image", e);
      window.open(result.image_url, "_blank");
    }
  };

  const handleReuse = () => {
    // Navigating back to main engine with state would be ideal,
    // but for now, we just go back to the engine. The user can copy the prompt.
    router.push("/thumbnail-engine");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400 mb-4" />
        <p className="text-gray-500 font-medium">Loading thumbnail details...</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Thumbnail not found</h3>
        <Link href="/thumbnail-engine/history">
          <Button variant="secondary">Back to History</Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <Header 
        title="Saved Thumbnail" 
        subtitle={`Generated on ${format(new Date(result.created_at), "MMM d, yyyy")}`}
      />

      <div className="p-8 max-w-5xl mx-auto space-y-6">
        
        <Link 
          href="/thumbnail-engine/history"
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors mb-2"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to History
        </Link>
        
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
              Based on {result.input_type}
            </p>
            <h2 className="text-xl font-bold text-gray-900 line-clamp-1">{result.user_input}</h2>
          </div>
          <div className={`px-4 py-2 rounded-lg flex items-center gap-2 font-medium flex-shrink-0 ${
            result.video_type === "long" ? "bg-blue-50 text-blue-700" : "bg-purple-50 text-purple-700"
          }`}>
            {result.video_type === "long" ? (
              <><PlaySquare className="w-5 h-5" /> 16:9 Format</>
            ) : (
              <><Smartphone className="w-5 h-5" /> 9:16 Format</>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Image Panel */}
          <div className="lg:col-span-7">
            <Card className="overflow-hidden bg-gray-900 border-0 shadow-xl">
              <div className="p-6 flex flex-col items-center">
                <div className={`relative rounded-lg overflow-hidden border border-gray-800 shadow-2xl ${result.video_type === "long" ? "w-full aspect-[16/9]" : "w-[320px] aspect-[9/16]"}`}>
                  <img 
                    src={result.image_url} 
                    alt="Saved Thumbnail" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex gap-3 mt-6">
                  <Button onClick={handleDownload} className="bg-white text-gray-900 hover:bg-gray-100 rounded-full px-6">
                    <Download className="w-4 h-4 mr-2" /> Download
                  </Button>
                  <Button onClick={handleReuse} variant="secondary" className="bg-gray-800 text-white hover:bg-gray-700 border-0 rounded-full px-6">
                    <RefreshCw className="w-4 h-4 mr-2" /> Generate Similar
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Details Panel */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="shadow-sm">
              <CardBody className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900 text-sm">Optimized Prompt</h4>
                  <Button variant="ghost" size="sm" onClick={handleCopyPrompt} className="h-8 px-2">
                    {copiedPrompt ? <CheckCircle2 className="w-4 h-4 text-green-600 mr-1.5" /> : <Copy className="w-4 h-4 mr-1.5 text-gray-500" />}
                    <span className={copiedPrompt ? "text-green-600" : "text-gray-600"}>Copy</span>
                  </Button>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-sm text-gray-600 leading-relaxed max-h-[200px] overflow-y-auto">
                  {result.optimized_prompt}
                </div>
              </CardBody>
            </Card>

            <Card className="shadow-sm">
              <CardBody className="p-5 space-y-4">
                <h4 className="font-semibold text-gray-900 text-sm mb-3">Generation Details</h4>
                <div className="grid grid-cols-2 gap-y-4 text-sm">
                  <div>
                    <p className="text-gray-400 text-xs font-semibold uppercase">Model</p>
                    <p className="text-gray-900 font-medium truncate">{result.model_name}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs font-semibold uppercase">Size</p>
                    <p className="text-gray-900 font-medium">{result.image_size}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs font-semibold uppercase">Category</p>
                    <p className="text-gray-900 font-medium">{result.category}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs font-semibold uppercase">Mood</p>
                    <p className="text-gray-900 font-medium">{result.mood}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs font-semibold uppercase">Seed</p>
                    <p className="text-gray-900 font-medium">{result.seed}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs font-semibold uppercase">Time</p>
                    <p className="text-gray-900 font-medium">{result.generation_time}s</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>

      </div>
    </>
  );
}
