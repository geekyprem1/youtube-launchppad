"use client";

import { useState } from "react";
import { 
  Sparkles, CheckCircle2, AlertTriangle, TrendingUp, Download, RefreshCw, XCircle, Zap
} from "lucide-react";
import { ScoreRing } from "@/components/ui/ScoreRing";
import type { ChannelReport } from "@/domains/channel-engine/types";
import Link from "next/link";

interface Props {
  report: ChannelReport;
  onRerun?: () => void;
  showBackToHistory?: boolean;
}

export function ChannelReportView({ report, onRerun, showBackToHistory }: Props) {
  const [activeTab, setActiveTab] = useState<"findings" | "strategy" | "metrics">("findings");

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500 bg-green-50";
    if (score >= 60) return "text-yellow-500 bg-yellow-50";
    return "text-red-500 bg-red-50";
  };

  return (
    <div className="space-y-6">
      
      {/* Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3">
          {report.analysis_type === "ai_smart" && (
            <span className="bg-purple-100 text-purple-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> AI Smart Audit (Estimated)
            </span>
          )}
          <h2 className="font-bold text-gray-900">{report.overview.channel_name}</h2>
        </div>
        <div className="flex gap-2">
          {showBackToHistory && (
            <Link href="/dashboard/history" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl flex items-center gap-2">
              Back to History
            </Link>
          )}
          {onRerun && (
            <button onClick={onRerun} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl flex items-center gap-2">
              <RefreshCw className="w-4 h-4" /> Re-run
            </button>
          )}
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl flex items-center gap-2 transition-colors shadow-sm">
            <Download className="w-4 h-4" /> Export Report
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        
        {/* Left Column: Overview & Health */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Health Score */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200 text-center shadow-sm">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-6">Overall Health</h3>
            <div className="flex justify-center mb-4">
              <ScoreRing score={report.overall_score} size={160} />
            </div>
            <h2 className="text-2xl font-black text-gray-900">
              {report.overall_score >= 80 ? "Excellent" : report.overall_score >= 60 ? "Good" : "Needs Improvement"}
            </h2>
            <p className="text-sm text-gray-500 mt-2">Based on {Object.keys(report.scorecards).length} ranking factors.</p>
          </div>

          {/* Overview Card */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-900 border-b pb-2">Channel Overview</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Niche</span><span className="font-semibold text-gray-900 text-right">{report.overview.niche}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Format</span><span className="font-semibold text-gray-900 text-right">{report.overview.primary_content_type}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Frequency</span><span className="font-semibold text-gray-900 text-right">{report.overview.upload_frequency}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Stage</span><span className="font-semibold text-gray-900 text-right">{report.overview.growth_stage}</span></div>
              <div>
                <span className="text-gray-500 block mb-1">Target Audience</span>
                <span className="font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded-md block">{report.overview.estimated_target_audience}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Detailed Tabs */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Tabs */}
          <div className="flex bg-white p-1.5 rounded-2xl border border-gray-200 gap-1 overflow-x-auto no-scrollbar shadow-sm">
            {[
              { id: "findings", label: "AI Findings" },
              { id: "strategy", label: "Action Plan & Strategy" },
              { id: "metrics", label: "Detailed Metrics" }
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`flex-1 min-w-[150px] py-2.5 px-4 text-sm font-semibold rounded-xl transition-all ${
                  activeTab === t.id ? "bg-gray-900 text-white shadow-md" : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm min-h-[500px]">
            
            {/* TAB 1: Findings */}
            {activeTab === "findings" && (
              <div className="space-y-8 animate-in fade-in">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
                    <CheckCircle2 className="w-5 h-5 text-green-500" /> What's Working
                  </h3>
                  <ul className="space-y-3">
                    {report.findings.what_is_working.map((item, i) => (
                      <li key={i} className="flex gap-3 text-sm text-gray-700"><div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 shrink-0"/>{item}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="bg-red-50 p-5 rounded-2xl border border-red-100">
                    <h3 className="text-base font-bold text-red-900 flex items-center gap-2 mb-3">
                      <XCircle className="w-4 h-4 text-red-600" /> Critical Mistakes
                    </h3>
                    <ul className="space-y-2">
                      {report.findings.critical_mistakes.map((item, i) => (
                        <li key={i} className="text-sm text-red-800 flex gap-2"><span className="shrink-0">•</span>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-yellow-50 p-5 rounded-2xl border border-yellow-100">
                    <h3 className="text-base font-bold text-yellow-900 flex items-center gap-2 mb-3">
                      <AlertTriangle className="w-4 h-4 text-yellow-600" /> Growth Blockers
                    </h3>
                    <ul className="space-y-2">
                      {report.findings.growth_blockers.map((item, i) => (
                        <li key={i} className="text-sm text-yellow-800 flex gap-2"><span className="shrink-0">•</span>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-blue-500" /> Missed Opportunities
                  </h3>
                  <ul className="space-y-3">
                    {report.findings.missed_opportunities.map((item, i) => (
                      <li key={i} className="flex gap-3 text-sm text-gray-700"><div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0"/>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* TAB 2: Strategy */}
            {activeTab === "strategy" && (
              <div className="space-y-8 animate-in fade-in">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Priority Action Plan</h3>
                  <div className="space-y-3">
                    {report.strategy.action_plan.map((act, i) => {
                      const badge = act.impact === "High" ? "bg-red-100 text-red-700" : act.impact === "Medium" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-700";
                      return (
                        <div key={i} className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50">
                          <div className="shrink-0">
                            <span className={`text-xs font-bold px-2 py-1 rounded uppercase tracking-wider ${badge}`}>{act.impact} Priority</span>
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900 text-sm mb-1">{act.title}</h4>
                            <p className="text-sm text-gray-600">{act.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
                  <h3 className="text-base font-bold text-blue-900 flex items-center gap-2 mb-3">
                    <Zap className="w-4 h-4 text-blue-600" /> Quick Wins (Do This Today)
                  </h3>
                  <ul className="space-y-2">
                    {report.strategy.quick_wins.map((item, i) => (
                      <li key={i} className="text-sm text-blue-800 flex gap-2"><span className="shrink-0 text-blue-400">→</span>{item}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-gray-500" /> Long-Term Roadmap
                  </h3>
                  <div className="grid sm:grid-cols-3 gap-4">
                    {[
                      { title: "Next 30 Days", items: report.strategy.long_term.days_30 },
                      { title: "Next 90 Days", items: report.strategy.long_term.days_90 },
                      { title: "6 Months", items: report.strategy.long_term.months_6 }
                    ].map((phase, i) => (
                      <div key={i} className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                        <h4 className="font-bold text-sm text-gray-900 mb-3 pb-2 border-b">{phase.title}</h4>
                        <ul className="space-y-2">
                          {phase.items.map((item, j) => (
                            <li key={j} className="text-xs text-gray-600 flex gap-1.5"><span className="shrink-0 text-gray-400">•</span>{item}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: Detailed Metrics */}
            {activeTab === "metrics" && (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4 animate-in fade-in">
                {Object.entries(report.scorecards).map(([key, card]: [string, any]) => {
                  const style = getScoreColor(card.score);
                  return (
                    <div key={key} className="p-4 border border-gray-100 rounded-xl bg-gray-50 hover:bg-white hover:border-blue-200 hover:shadow-md transition-all">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold text-gray-900 text-xs uppercase tracking-wider">{key.replace(/_/g, " ")}</h4>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${style}`}>{card.score}/100</span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-200 rounded-full mb-3 overflow-hidden">
                        <div className={`h-full rounded-full ${style.split(" ")[1].replace('bg-','bg-').replace('50','500')}`} style={{ width: `${card.score}%` }} />
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-3" title={card.reason}>{card.reason}</p>
                    </div>
                  );
                })}
              </div>
            )}
            
          </div>
        </div>

      </div>
    </div>
  );
}
