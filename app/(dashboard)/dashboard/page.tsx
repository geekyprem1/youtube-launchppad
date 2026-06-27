"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Card, CardBody } from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/client";
import { 
  Zap, ArrowRight, Target, Activity, CheckCircle, 
  Search, BarChart, TrendingUp, History, Sparkles 
} from "lucide-react";
import Link from "next/link";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function DashboardPage() {
  const [firstName, setFirstName] = useState("Creator");
  const [url, setUrl] = useState("");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      const name = user.user_metadata?.full_name?.split(" ")[0] || "Creator";
      setFirstName(name);
    });
  }, []);

  return (
    <div className="flex flex-col h-full">
      <Header title="Command Center" subtitle={`Good morning, ${firstName}.`} />
      
      <div className="p-8 max-w-5xl mx-auto space-y-12">
        {/* Quick Analyze */}
        <div className="max-w-2xl mx-auto">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Quick Analyze: Paste any YouTube URL to audit..."
                className="w-full pl-9 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              />
            </div>
            <Button disabled={!url.trim()} className="px-6 rounded-xl">Analyze</Button>
          </div>
        </div>

        <div className="grid md:grid-cols-12 gap-8">
          
          {/* Main Left Column: Mission & Briefing */}
          <div className="md:col-span-8 space-y-8">
            
            {/* Mission Mode */}
            <section>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-600" /> Today&apos;s Mission
                </h2>
                <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                  Focus Mode
                </span>
              </div>
              <Card className="border-blue-100 bg-gradient-to-r from-blue-50/50 to-transparent">
                <CardBody className="p-6">
                  <div className="flex gap-6 items-center">
                    <div className="flex-1 space-y-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Publish one high-opportunity tutorial</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Based on your AI Memory, tutorials outperform your other content by 41%. 
                          Competition is low today.
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="flex items-center gap-3 text-sm text-gray-700">
                          <CheckCircle className="w-4 h-4 text-green-500" /> Topic selected
                        </label>
                        <label className="flex items-center gap-3 text-sm text-gray-700">
                          <CheckCircle className="w-4 h-4 text-green-500" /> Title optimized
                        </label>
                        <label className="flex items-center gap-3 text-sm text-gray-400">
                          <div className="w-4 h-4 rounded-full border border-gray-300" /> Thumbnail generated
                        </label>
                        <label className="flex items-center gap-3 text-sm text-gray-400">
                          <div className="w-4 h-4 rounded-full border border-gray-300" /> Scheduled
                        </label>
                      </div>
                      
                      <div className="pt-2">
                        <Link href="/optimize">
                          <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white shadow-sm border-none">
                            Continue Mission <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                    <div className="hidden sm:block text-center space-y-1">
                      <ScoreRing score={50} size={100} />
                      <p className="text-xs font-medium text-gray-500">Mission Progress</p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </section>

            {/* Daily Briefing */}
            <section>
              <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-gray-700" /> AI Daily Briefing
              </h2>
              <div className="grid sm:grid-cols-3 gap-4">
                <Card className="hover:shadow-sm transition-all cursor-pointer">
                  <CardBody className="p-4 space-y-2">
                    <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <h4 className="font-semibold text-gray-900 text-sm">Competitor Alert</h4>
                    <p className="text-xs text-gray-500">MrBeast uploaded 2 hrs ago. High threat to your current niche.</p>
                  </CardBody>
                </Card>
                <Card className="hover:shadow-sm transition-all cursor-pointer">
                  <CardBody className="p-4 space-y-2">
                    <div className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <h4 className="font-semibold text-gray-900 text-sm">Trend Exploding</h4>
                    <p className="text-xs text-gray-500">"AI Agents" search volume up 312% in the last 24h.</p>
                  </CardBody>
                </Card>
                <Card className="hover:shadow-sm transition-all cursor-pointer">
                  <CardBody className="p-4 space-y-2">
                    <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                      <BarChart className="w-4 h-4" />
                    </div>
                    <h4 className="font-semibold text-gray-900 text-sm">Yesterday&apos;s Growth</h4>
                    <p className="text-xs text-gray-500">+420 Subs, but CTR dropped by 8% overall.</p>
                  </CardBody>
                </Card>
              </div>
            </section>
            
          </div>

          {/* Right Column: Scorecard & Timeline */}
          <div className="md:col-span-4 space-y-8">
            
            {/* System Health Scorecard */}
            <section>
              <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-gray-700" /> System Health
              </h2>
              <Card>
                <CardBody className="p-5">
                  <div className="flex items-center gap-4 mb-6">
                    <ScoreRing score={88} size={64} />
                    <div>
                      <p className="font-bold text-gray-900 text-lg">88/100</p>
                      <p className="text-xs text-gray-500">Overall Channel Health</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {[
                      { label: "Idea Quality", score: 92 },
                      { label: "Consistency", score: 84 },
                      { label: "SEO & Discovery", score: 71 },
                      { label: "Packaging", score: 89 },
                      { label: "Audience Match", score: 94 },
                    ].map((stat, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="text-gray-600 font-medium">{stat.label}</span>
                          <span className="text-gray-900 font-bold">{stat.score}</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gray-900"
                            style={{ width: `${stat.score}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                      <strong className="text-gray-900">AI Advice:</strong> Your SEO score is dragging down your overall health. Run a channel audit to fix missing tags.
                    </p>
                  </div>
                </CardBody>
              </Card>
            </section>

            {/* Personal Growth Timeline */}
            <section>
              <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <History className="w-5 h-5 text-gray-700" /> Growth Timeline
              </h2>
              <Card>
                <CardBody className="p-5">
                  <div className="space-y-6 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                    
                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-5 h-5 rounded-full border-2 border-white bg-blue-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2" />
                      <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] px-2">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-semibold text-blue-600 uppercase">April</span>
                          <span className="text-sm font-bold text-gray-900">Subs Accelerated</span>
                        </div>
                      </div>
                    </div>

                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-5 h-5 rounded-full border-2 border-white bg-gray-300 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2" />
                      <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] px-2">
                        <div className="flex flex-col md:text-right">
                          <span className="text-[10px] font-semibold text-gray-500 uppercase">March</span>
                          <span className="text-sm font-bold text-gray-700">Views Doubled</span>
                        </div>
                      </div>
                    </div>

                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-5 h-5 rounded-full border-2 border-white bg-gray-300 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2" />
                      <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] px-2">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-semibold text-gray-500 uppercase">February</span>
                          <span className="text-sm font-bold text-gray-700">Retention Improved</span>
                        </div>
                      </div>
                    </div>

                  </div>
                </CardBody>
              </Card>
            </section>
            
          </div>
        </div>
      </div>
    </div>
  );
}
