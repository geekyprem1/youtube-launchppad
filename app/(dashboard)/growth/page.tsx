"use client";

import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Card, CardBody } from "@/components/ui/Card";
import {
  Activity,
  Lightbulb,
  Users,
  Search,
  ArrowRight,
  Radar,
} from "lucide-react";

const MODULES = [
  {
    href: "/dashboard",
    icon: Activity,
    title: "Channel Engine",
    desc: "Full channel audit, health scores, and growth diagnosis.",
    color: "bg-indigo-50 text-indigo-700 border-indigo-100",
  },
  {
    href: "/ideas",
    icon: Lightbulb,
    title: "Recommendation Engine",
    desc: "AI video ideas matched to your niche and demand.",
    color: "bg-amber-50 text-amber-800 border-amber-100",
  },
  {
    href: "/competitors",
    icon: Users,
    title: "Competitor Intel",
    desc: "Spy on rival channels — formats, gaps, and threats.",
    color: "bg-rose-50 text-rose-800 border-rose-100",
  },
  {
    href: "/keywords",
    icon: Search,
    title: "Keyword Research",
    desc: "Opportunity scores, long-tails, and title angles.",
    color: "bg-emerald-50 text-emerald-800 border-emerald-100",
  },
];

export default function GrowthRadarHubPage() {
  return (
    <>
      <Header
        title="GrowthRadar"
        subtitle="Channel audit · Ideas · Competitors · Keywords — one growth stack"
      />

      <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8">
        <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-600 to-blue-600 p-6 md:p-8 text-white">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center">
              <Radar className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Find high-growth opportunities</h2>
              <p className="text-sm text-indigo-100 mt-1 max-w-xl">
                GrowthRadar packages your research stack. Jump into any module —
                each is gated by OTO5 (or Infinity).
              </p>
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {MODULES.map((m) => {
            const Icon = m.icon;
            return (
              <Link key={m.href} href={m.href}>
                <Card className="h-full hover:shadow-md transition-shadow border-gray-200 hover:border-indigo-200">
                  <CardBody className="p-5 flex gap-4">
                    <div
                      className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 ${m.color}`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 flex items-center gap-1">
                        {m.title}
                        <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                      </p>
                      <p className="text-sm text-gray-500 mt-1">{m.desc}</p>
                    </div>
                  </CardBody>
                </Card>
              </Link>
            );
          })}
        </div>

        <Card>
          <CardBody className="p-5 text-sm text-gray-600">
            <p className="font-semibold text-gray-900 mb-1">Suggested order</p>
            <ol className="list-decimal list-inside space-y-1 text-gray-600">
              <li>Run a Channel Engine audit</li>
              <li>Pull competitor gaps</li>
              <li>Validate with Keyword Research</li>
              <li>Generate ideas in Recommendation Engine</li>
            </ol>
          </CardBody>
        </Card>
      </div>
    </>
  );
}
