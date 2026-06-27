"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { 
  Activity, AlertTriangle, Zap, CheckCircle, 
  ArrowRight, Search, Clock, BarChart, PenTool
} from "lucide-react";
import { ScoreRing } from "@/components/ui/ScoreRing";

export default function ChannelAuditPage() {
  const [channelUrl, setChannelUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  async function runAudit() {
    if (!channelUrl.trim()) return;
    setLoading(true);
    setResult(null);
    
    try {
      const res = await fetch("/api/channel-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channelUrl }),
      });
      const data = await res.json();
      
      if (data.metrics) {
        setResult({
          growth_score: data.metrics.growth_score,
          status: data.metrics.growth_score > 80 ? "Healthy Channel" : data.metrics.growth_score > 50 ? "Growth Bottlenecks Detected" : "Critical Optimization Required",
          priority_queue: data.analysis?.priority_queue?.map((q: any, i: number) => ({ ...q, id: i + 1 })) || [],
          upgrade_hook: data.analysis?.upgrade_hook
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
      <Header title="Diagnostics" subtitle="Why Are Your Videos Not Getting Views? Let the AI Doctor find out." />
      
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
                onKeyDown={(e) => e.key === "Enter" && runAudit()}
                placeholder="Paste your YouTube channel URL to diagnose..."
                className="w-full pl-9 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              />
            </div>
            <Button onClick={runAudit} disabled={!channelUrl.trim()} loading={loading} className="px-6 rounded-xl bg-blue-600 hover:bg-blue-700">
              <Activity className="w-4 h-4 mr-2" /> Diagnose
            </Button>
          </div>
        </div>

        {/* Premium Empty State */}
        {!loading && !result && (
          <div className="text-center py-24 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Identify Your Growth Bottlenecks</h3>
            <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">
              CreatorOS AI will analyze your recent uploads to find exactly what is stopping your channel from growing and tell you how to fix it.
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
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-6">
                <ScoreRing score={result.growth_score} size={80} />
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{result.status}</h2>
                  <p className="text-sm text-gray-500 mt-1">Your channel requires immediate optimization to restore algorithmic reach.</p>
                </div>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm border-none px-6">
                <Sparkles className="w-4 h-4 mr-2" /> Fix All With AI
              </Button>
            </div>

            <div className="space-y-6">
              <h3 className="text-lg font-bold text-gray-900">Priority Fix Queue</h3>
              
              {result.priority_queue.map((item: any) => (
                <Card key={item.id} className="overflow-hidden border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <CardBody className="p-0">
                    <div className="grid md:grid-cols-12">
                      
                      {/* Left: Issue */}
                      <div className="md:col-span-8 p-6 border-r border-gray-100">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="w-6 h-6 bg-red-100 text-red-700 rounded text-xs font-bold flex items-center justify-center">
                            #{item.id}
                          </span>
                          <h4 className="text-lg font-bold text-gray-900">{item.issue}</h4>
                        </div>
                        
                        <div className="bg-red-50/50 border border-red-100 rounded-lg p-3 mb-4">
                          <p className="text-xs font-semibold text-red-900 flex items-center gap-1 mb-1">
                            <AlertTriangle className="w-3.5 h-3.5" /> WHY
                          </p>
                          <p className="text-sm text-red-800">{item.why}</p>
                        </div>
                        
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">AI Solution</p>
                          <p className="text-sm font-medium text-gray-900">{item.fix}</p>
                        </div>
                      </div>

                      {/* Right: Metrics & Action */}
                      <div className="md:col-span-4 p-6 flex flex-col justify-between bg-gray-50/50">
                        <div className="space-y-3 mb-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Expected Improvement</span>
                            <span className="font-bold text-green-600">{item.expected_improvement}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Time Required</span>
                            <span className="font-medium text-gray-900">{item.time}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Difficulty</span>
                            <span className="font-medium text-gray-900">{item.difficulty}</span>
                          </div>
                        </div>

                        <div className="space-y-2 mt-auto">
                          <Button size="sm" className="w-full bg-white border-gray-300 text-gray-700 hover:bg-gray-50 shadow-sm">
                            <PenTool className="w-3.5 h-3.5 mr-2" /> Fix With AI
                          </Button>
                        </div>
                      </div>

                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function Sparkles(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
    </svg>
  );
}
