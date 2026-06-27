"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { 
  Lightbulb, Zap, TrendingUp, Search, Clock, Users, CalendarDays, BarChart, PenTool
} from "lucide-react";

export default function IdeasPage() {
  const [niche, setNiche] = useState("");
  const [loading, setLoading] = useState(false);
  const [ideas, setIdeas] = useState<any[]>([]);

  async function generate() {
    if (!niche.trim()) return;
    setLoading(true);
    
    try {
      const res = await fetch("/api/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche }),
      });
      const data = await res.json();
      
      if (data.ideas) {
        setIdeas(data.ideas);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Header title="Recommendation Engine" subtitle="AI-driven video opportunities prioritized by ROI and Channel Fit." />
      
      <div className="p-8 max-w-6xl mx-auto space-y-8">

        {/* Global AI Command Input for this page */}
        <div className="max-w-2xl mx-auto">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && generate()}
                placeholder="Ask CreatorOS: e.g., 'What should I upload tomorrow?' or enter a broad niche..."
                className="w-full pl-9 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              />
            </div>
            <Button onClick={generate} disabled={!niche.trim()} loading={loading} className="px-6 rounded-xl bg-blue-600 hover:bg-blue-700">
              <Zap className="w-4 h-4 mr-2" /> Find Opportunities
            </Button>
          </div>
        </div>

        {/* Premium Empty State */}
        {!loading && ideas.length === 0 && (
          <div className="text-center py-24 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Lightbulb className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No active recommendations</h3>
            <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">
              CreatorOS AI analyzes your audience, trends, and competitors to surface high-ROI video topics. Enter a prompt above to start the engine.
            </p>
            <div className="flex justify-center gap-4 text-xs font-medium text-gray-400">
              <span className="flex items-center gap-1"><TrendingUp className="w-4 h-4" /> Trend Analysis</span>
              <span className="flex items-center gap-1"><Users className="w-4 h-4" /> Audience Match</span>
              <span className="flex items-center gap-1"><BarChart className="w-4 h-4" /> Opportunity Score</span>
            </div>
          </div>
        )}

        {loading && (
          <div className="space-y-6">
            <div className="h-64 bg-white rounded-xl border border-gray-100 animate-pulse" />
            <div className="h-64 bg-white rounded-xl border border-gray-100 animate-pulse" />
          </div>
        )}

        {/* Results */}
        {!loading && ideas.length > 0 && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900">Highest ROI Opportunities</h2>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" className="bg-white">Filter by Category</Button>
                <Button variant="secondary" size="sm" className="bg-white">Trending First</Button>
              </div>
            </div>

            {ideas.map((idea) => (
              <Card key={idea.id} className="overflow-hidden border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <CardBody className="p-0">
                  <div className="grid md:grid-cols-12">
                    
                    {/* Left: Opportunity Score */}
                    <div className="md:col-span-3 bg-gray-50 p-6 border-r border-gray-100 flex flex-col items-center justify-center">
                      <ScoreRing score={idea.opportunity_score} size={96} />
                      <div className="mt-2 text-center">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Opportunity Score™</p>
                        <Badge variant="blue">{idea.type}</Badge>
                      </div>
                    </div>

                    {/* Middle: Details & WHY */}
                    <div className="md:col-span-6 p-6 border-r border-gray-100">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{idea.topic}</h3>
                      
                      <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-3 mb-4">
                        <p className="text-xs font-semibold text-blue-900 flex items-center gap-1 mb-1">
                          <Zap className="w-3.5 h-3.5" /> Why AI Recommends This
                        </p>
                        <p className="text-sm text-blue-800">{idea.analysis?.why}</p>
                      </div>

                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Score Breakdown</p>
                        <div className="flex flex-wrap gap-2">
                          {idea.score_breakdown.map((b: any, i: number) => (
                            <div key={i} className="text-xs bg-gray-50 border border-gray-200 rounded px-2 py-1">
                              <span className="text-gray-500 mr-1">{b.label}</span>
                              <span className={b.color + " font-medium"}>{b.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right: ROI Engine & Actions */}
                    <div className="md:col-span-3 p-6 flex flex-col justify-between">
                      <div className="space-y-3 mb-4">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Expected ROI</p>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Reach</span>
                          <span className="font-semibold text-gray-900">{idea.roi.reach}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Subs</span>
                          <span className="font-semibold text-green-600">{idea.roi.subs}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Confidence</span>
                          <span className="font-semibold text-blue-600">{idea.roi.confidence}%</span>
                        </div>
                      </div>

                      <div className="space-y-2 mt-auto">
                        <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm border-none">
                          <PenTool className="w-3.5 h-3.5 mr-2" /> Generate Concept
                        </Button>
                        <Button size="sm" variant="secondary" className="w-full">
                          <CalendarDays className="w-3.5 h-3.5 mr-2" /> Add to Calendar
                        </Button>
                      </div>
                    </div>

                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
