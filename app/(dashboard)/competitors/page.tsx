"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { 
  Users, TrendingUp, Target, Search, AlertTriangle, PlayCircle, Eye, Clock, PenTool, Zap
} from "lucide-react";

export default function CompetitorsPage() {
  const [channelUrl, setChannelUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  async function analyze() {
    if (!channelUrl.trim()) return;
    setLoading(true);
    setResult(null);
    
    try {
      const res = await fetch("/api/competitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channelUrl }),
      });
      const data = await res.json();
      
      if (data.metrics) {
        setResult({
          channel_name: data.metrics.channel_name,
          threat_level: data.metrics.threat_level,
          threat_reason: data.analysis?.threat_reason,
          recent_viral: data.metrics.recent_viral,
          opportunity_gaps: data.analysis?.opportunity_gaps || []
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
      <Header title="Competitor Intel" subtitle="Discover what your competitors are NOT doing and steal their audience." />
      
      <div className="p-8 max-w-6xl mx-auto space-y-8">
        
        {/* Quick Analyze */}
        <div className="max-w-2xl mx-auto">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={channelUrl}
                onChange={(e) => setChannelUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && analyze()}
                placeholder="Paste competitor's YouTube channel URL..."
                className="w-full pl-9 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              />
            </div>
            <Button onClick={analyze} disabled={!channelUrl.trim()} loading={loading} className="px-6 rounded-xl bg-blue-600 hover:bg-blue-700">
              <Target className="w-4 h-4 mr-2" /> Find Gaps
            </Button>
          </div>
        </div>

        {/* Premium Empty State */}
        {!loading && !result && (
          <div className="text-center py-24 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Users className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Find Your Opportunity Gap</h3>
            <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">
              CreatorOS AI analyzes your competitors to find the videos they are NOT making, the keywords they ignored, and the audiences they missed.
            </p>
          </div>
        )}

        {loading && (
          <div className="space-y-6">
            <div className="h-32 bg-white rounded-xl border border-gray-100 animate-pulse" />
            <div className="h-64 bg-white rounded-xl border border-gray-100 animate-pulse" />
          </div>
        )}

        {/* Results */}
        {!loading && result && (
          <div className="space-y-8">
            
            {/* Threat Level */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-xl font-bold text-gray-900">{result.channel_name}</h2>
                  <span className="bg-orange-100 text-orange-800 text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wider flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Threat Level: {result.threat_level}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{result.threat_reason}</p>
              </div>
            </div>

            <div className="grid md:grid-cols-12 gap-8">
              
              {/* Left: Recent Viral & Missing */}
              <div className="md:col-span-4 space-y-6">
                <Card className="border-gray-200 shadow-sm">
                  <CardBody className="p-5">
                    <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-purple-600" /> Latest Viral Video
                    </h3>
                    <div className="aspect-video bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                      <PlayCircle className="w-8 h-8 text-gray-300" />
                    </div>
                    <p className="font-semibold text-gray-900 text-sm leading-snug mb-3">"{result.recent_viral.title}"</p>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-gray-50 p-2 rounded border border-gray-100">
                        <span className="text-gray-500 block mb-0.5">Estimated Views</span>
                        <span className="font-bold text-gray-900 flex items-center gap-1"><Eye className="w-3 h-3 text-blue-500" /> {result.recent_viral.views}</span>
                      </div>
                      <div className="bg-gray-50 p-2 rounded border border-gray-100">
                        <span className="text-gray-500 block mb-0.5">Estimated CTR</span>
                        <span className="font-bold text-gray-900 flex items-center gap-1"><Target className="w-3 h-3 text-green-500" /> {result.recent_viral.ctr}</span>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </div>

              {/* Right: Opportunity Gaps */}
              <div className="md:col-span-8 space-y-4">
                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <Target className="w-5 h-5 text-green-600" /> Discovered Opportunity Gaps
                </h3>
                
                {result.opportunity_gaps.map((gap: any, i: number) => (
                  <Card key={i} className="border-gray-200 shadow-sm hover:border-green-200 transition-colors">
                    <CardBody className="p-5">
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-1">
                          <span className="inline-block text-xs font-bold text-purple-600 uppercase tracking-wider mb-2">
                            {gap.gap_type}
                          </span>
                          <p className="text-sm text-gray-600 mb-3">{gap.description}</p>
                          
                          <div className="bg-green-50/50 border border-green-100 rounded-lg p-3">
                            <p className="text-xs font-semibold text-green-900 flex items-center gap-1 mb-1">
                              <Zap className="w-3.5 h-3.5" /> AI Recommended Action
                            </p>
                            <p className="text-sm font-medium text-green-800">{gap.action}</p>
                          </div>
                        </div>
                        
                        <div className="md:w-40 shrink-0 flex flex-col justify-end">
                          <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 text-white border-none shadow-sm">
                            <PenTool className="w-3.5 h-3.5 mr-2" /> Execute
                          </Button>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>

            </div>
          </div>
        )}
      </div>
    </>
  );
}
