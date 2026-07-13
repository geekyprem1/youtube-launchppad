"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import {
  TrendingUp,
  PieChart,
  Package,
  Calculator,
  Handshake,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Sparkles,
  Copy,
  Check,
} from "lucide-react";

type Tab =
  | "revenue_planner"
  | "digital_product"
  | "roi_tracker"
  | "brand_deals";

const TABS: { id: Tab; label: string; icon: typeof PieChart; desc: string }[] =
  [
    {
      id: "revenue_planner",
      label: "Revenue Planner",
      icon: PieChart,
      desc: "Multi-stream income plan",
    },
    {
      id: "digital_product",
      label: "Digital Products",
      icon: Package,
      desc: "What to sell & how to launch",
    },
    {
      id: "roi_tracker",
      label: "ROI Tracker",
      icon: Calculator,
      desc: "Costs vs profit health",
    },
    {
      id: "brand_deals",
      label: "Brand Deals",
      icon: Handshake,
      desc: "Packages, pitch, contracts",
    },
  ];

export default function ProfitPage() {
  const [tab, setTab] = useState<Tab>("revenue_planner");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState("");

  const [niche, setNiche] = useState("");
  const [subs, setSubs] = useState("0");
  const [monthlyViews, setMonthlyViews] = useState("0");
  const [country, setCountry] = useState("United States");
  const [adsense, setAdsense] = useState("0");

  const [hoursWeek, setHoursWeek] = useState("10");
  const [targetMonthly, setTargetMonthly] = useState("1000");
  const [currentStreams, setCurrentStreams] = useState("");

  const [skills, setSkills] = useState("");
  const [pain, setPain] = useState("");
  const [pricePref, setPricePref] = useState("mid");

  const [otherRev, setOtherRev] = useState("0");
  const [adSpend, setAdSpend] = useState("0");
  const [toolsCost, setToolsCost] = useState("0");
  const [freelanceCost, setFreelanceCost] = useState("0");
  const [investments, setInvestments] = useState("");

  const [avgViews, setAvgViews] = useState("");
  const [engagement, setEngagement] = useState("");
  const [pastDeals, setPastDeals] = useState("");
  const [brandCats, setBrandCats] = useState("");

  function switchTab(t: Tab) {
    setTab(t);
    setResult(null);
    setError("");
  }

  async function runTool() {
    if (!niche.trim()) {
      setError("Niche is required");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);

    const base = {
      niche: niche.trim(),
      subs: Number(subs) || 0,
      monthly_views: Number(monthlyViews) || 0,
      country,
      monthly_adsense_usd: Number(adsense) || 0,
    };

    let body: Record<string, unknown> = { tool: tab, ...base };

    if (tab === "revenue_planner") {
      body = {
        ...body,
        hours_per_week: Number(hoursWeek) || 10,
        target_monthly_usd: Number(targetMonthly) || 1000,
        current_streams: currentStreams,
      };
    }
    if (tab === "digital_product") {
      body = {
        ...body,
        skills,
        audience_pain: pain,
        price_preference: pricePref,
      };
    }
    if (tab === "roi_tracker") {
      body = {
        ...body,
        other_revenue_usd: Number(otherRev) || 0,
        ad_spend_usd: Number(adSpend) || 0,
        tools_cost_usd: Number(toolsCost) || 0,
        freelance_cost_usd: Number(freelanceCost) || 0,
        investments,
      };
    }
    if (tab === "brand_deals") {
      body = {
        ...body,
        avg_views: Number(avgViews) || 0,
        engagement_rate_pct: Number(engagement) || 0,
        past_deals: pastDeals,
        brand_categories: brandCats,
      };
    }

    try {
      const res = await fetch("/api/profit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  async function copyText(text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(text.slice(0, 48));
    setTimeout(() => setCopied(""), 1500);
  }

  return (
    <>
      <Header
        title="Profit Accelerator"
        subtitle="Revenue planner · Digital products · ROI tracker · Brand deal toolkit"
      />

      <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
        <div className="flex flex-wrap gap-2">
          {TABS.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => switchTab(t.id)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all",
                  tab === t.id
                    ? "bg-violet-600 text-white border-violet-600 shadow-sm"
                    : "bg-white text-gray-600 border-gray-200 hover:border-violet-200 hover:bg-violet-50/50"
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden md:inline">{t.label}</span>
                <span className="md:hidden">
                  {t.label.split(" ")[0]}
                </span>
              </button>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-4">
            <Card>
              <CardBody className="p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-violet-600" />
                  <h2 className="font-bold text-gray-900">
                    {TABS.find((t) => t.id === tab)?.label}
                  </h2>
                </div>
                <p className="text-xs text-gray-500 -mt-2">
                  {TABS.find((t) => t.id === tab)?.desc}
                </p>

                <Input
                  label="Niche *"
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  placeholder="e.g. Excel for finance jobs"
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Subscribers"
                    type="number"
                    value={subs}
                    onChange={(e) => setSubs(e.target.value)}
                  />
                  <Input
                    label="Monthly views"
                    type="number"
                    value={monthlyViews}
                    onChange={(e) => setMonthlyViews(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                  />
                  <Input
                    label="AdSense $/mo"
                    type="number"
                    value={adsense}
                    onChange={(e) => setAdsense(e.target.value)}
                  />
                </div>

                {tab === "revenue_planner" && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        label="Hours / week"
                        type="number"
                        value={hoursWeek}
                        onChange={(e) => setHoursWeek(e.target.value)}
                      />
                      <Input
                        label="Target $/mo"
                        type="number"
                        value={targetMonthly}
                        onChange={(e) => setTargetMonthly(e.target.value)}
                      />
                    </div>
                    <Textarea
                      label="Current income streams"
                      value={currentStreams}
                      onChange={(e) => setCurrentStreams(e.target.value)}
                      placeholder="e.g. only AdSense, some affiliate links"
                      rows={2}
                    />
                  </>
                )}

                {tab === "digital_product" && (
                  <>
                    <Textarea
                      label="Your skills / expertise"
                      value={skills}
                      onChange={(e) => setSkills(e.target.value)}
                      rows={2}
                    />
                    <Textarea
                      label="Audience pain points"
                      value={pain}
                      onChange={(e) => setPain(e.target.value)}
                      rows={2}
                    />
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price preference
                      </label>
                      <select
                        value={pricePref}
                        onChange={(e) => setPricePref(e.target.value)}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white"
                      >
                        <option value="low">Low ($9–29)</option>
                        <option value="mid">Mid ($29–99)</option>
                        <option value="premium">Premium ($99+)</option>
                        <option value="unsure">Unsure</option>
                      </select>
                    </div>
                  </>
                )}

                {tab === "roi_tracker" && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        label="Other revenue $/mo"
                        type="number"
                        value={otherRev}
                        onChange={(e) => setOtherRev(e.target.value)}
                      />
                      <Input
                        label="Ad spend $"
                        type="number"
                        value={adSpend}
                        onChange={(e) => setAdSpend(e.target.value)}
                      />
                      <Input
                        label="Tools cost $"
                        type="number"
                        value={toolsCost}
                        onChange={(e) => setToolsCost(e.target.value)}
                      />
                      <Input
                        label="Freelance cost $"
                        type="number"
                        value={freelanceCost}
                        onChange={(e) => setFreelanceCost(e.target.value)}
                      />
                    </div>
                    <Textarea
                      label="Notes (investments / experiments)"
                      value={investments}
                      onChange={(e) => setInvestments(e.target.value)}
                      rows={2}
                      placeholder="e.g. paid thumbnail designer $200, course ads $150"
                    />
                  </>
                )}

                {tab === "brand_deals" && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        label="Avg views / video"
                        type="number"
                        value={avgViews}
                        onChange={(e) => setAvgViews(e.target.value)}
                      />
                      <Input
                        label="Engagement %"
                        type="number"
                        value={engagement}
                        onChange={(e) => setEngagement(e.target.value)}
                      />
                    </div>
                    <Textarea
                      label="Past deals (if any)"
                      value={pastDeals}
                      onChange={(e) => setPastDeals(e.target.value)}
                      rows={2}
                    />
                    <Input
                      label="Brand categories you want"
                      value={brandCats}
                      onChange={(e) => setBrandCats(e.target.value)}
                      placeholder="SaaS, education, finance apps…"
                    />
                  </>
                )}

                {error && (
                  <p className="text-sm text-red-600 flex items-center gap-1.5">
                    <XCircle className="w-4 h-4" /> {error}
                  </p>
                )}

                <Button
                  onClick={runTool}
                  loading={loading}
                  disabled={!niche.trim()}
                  className="w-full bg-violet-600 hover:bg-violet-700 text-white"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Run Profit Accelerator
                </Button>
                <p className="text-[10px] text-gray-400">
                  Plans and rates are guidance — not income guarantees.
                </p>
              </CardBody>
            </Card>
          </div>

          <div className="lg:col-span-7">
            {!loading && !result && (
              <div className="min-h-[320px] flex flex-col items-center justify-center text-center p-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <div className="w-14 h-14 rounded-2xl bg-violet-50 flex items-center justify-center mb-4">
                  <TrendingUp className="w-7 h-7 text-violet-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Grow beyond AdSense
                </h3>
                <p className="text-sm text-gray-500 max-w-sm">
                  Plan multi-stream revenue, design a digital product, track ROI,
                  and run brand deals like a business.
                </p>
              </div>
            )}

            {loading && (
              <div className="h-80 bg-white rounded-xl border animate-pulse" />
            )}

            {result && !loading && (
              <div className="space-y-4">
                {result.tool === "roi_tracker" && result.metrics && (
                  <Card className="overflow-hidden border-violet-100">
                    <div
                      className={cn(
                        "p-5 text-white",
                        result.metrics.profit >= 0
                          ? "bg-gradient-to-r from-violet-600 to-indigo-600"
                          : "bg-gradient-to-r from-red-600 to-rose-600"
                      )}
                    >
                      <p className="text-sm text-white/80">Net profit (month)</p>
                      <p className="text-3xl font-extrabold">
                        ${result.metrics.profit}
                      </p>
                      <p className="text-sm text-white/90 mt-1">
                        Revenue ${result.metrics.revenue} − Costs $
                        {result.metrics.costs} · ROI {result.metrics.roi_pct}% ·
                        Margin {result.metrics.margin_pct}%
                      </p>
                    </div>
                  </Card>
                )}

                {result.tool === "revenue_planner" && result.metrics && (
                  <Card>
                    <CardHeader>
                      <h3 className="text-sm font-semibold">
                        Suggested stream split (toward $
                        {result.metrics.target_monthly_usd})
                      </h3>
                    </CardHeader>
                    <CardBody className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-center">
                      {Object.entries(result.metrics.suggested_split || {}).map(
                        ([k, v]) => (
                          <div
                            key={k}
                            className="p-3 bg-violet-50/60 rounded-lg border border-violet-100"
                          >
                            <p className="text-[10px] uppercase text-violet-700 font-bold">
                              {k.replace(/_/g, " ")}
                            </p>
                            <p className="font-bold text-gray-900">${String(v)}</p>
                          </div>
                        )
                      )}
                    </CardBody>
                  </Card>
                )}

                {result.ai && (
                  <ProfitAi
                    tool={result.tool}
                    ai={result.ai}
                    onCopy={copyText}
                    copied={copied}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function ProfitAi({
  tool,
  ai,
  onCopy,
  copied,
}: {
  tool: string;
  ai: any;
  onCopy: (t: string) => void;
  copied: string;
}) {
  return (
    <div className="space-y-4">
      {ai.summary && (
        <Card className="border-violet-100 bg-violet-50/30">
          <CardBody className="p-5">
            <p className="text-sm text-gray-800">{ai.summary}</p>
            {ai.health && (
              <Badge
                className="mt-2"
                variant={
                  ai.health === "strong" || ai.health === "ok"
                    ? "green"
                    : ai.health === "weak"
                      ? "yellow"
                      : "red"
                }
              >
                Health: {ai.health}
              </Badge>
            )}
          </CardBody>
        </Card>
      )}

      {tool === "revenue_planner" && (
        <>
          {Array.isArray(ai.streams) &&
            ai.streams.map((s: any, i: number) => (
              <Card key={i}>
                <CardBody className="p-4 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-gray-900">{s.name}</p>
                    <Badge variant="purple">{s.monthly_target_usd}</Badge>
                    {s.effort && (
                      <Badge variant="default" className="text-[10px]">
                        {s.effort} effort
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{s.why}</p>
                  <ul className="space-y-1">
                    {(s.first_actions || []).map((a: string, j: number) => (
                      <li
                        key={j}
                        className="text-xs text-gray-700 flex gap-1.5"
                      >
                        <CheckCircle className="w-3.5 h-3.5 text-violet-500 shrink-0 mt-0.5" />
                        {a}
                      </li>
                    ))}
                  </ul>
                </CardBody>
              </Card>
            ))}
          {Array.isArray(ai.milestones) && ai.milestones.length > 0 && (
            <Card>
              <CardHeader>
                <h3 className="text-sm font-semibold">Milestones</h3>
              </CardHeader>
              <CardBody className="space-y-2">
                {ai.milestones.map((m: any, i: number) => (
                  <div key={i} className="text-sm p-2 bg-gray-50 rounded-lg">
                    <span className="font-semibold">Month {m.month}:</span>{" "}
                    {m.goal}
                    {m.metric && (
                      <span className="text-xs text-gray-500 block">
                        Metric: {m.metric}
                      </span>
                    )}
                  </div>
                ))}
              </CardBody>
            </Card>
          )}
          <Bullet title="Avoid" items={ai.avoid} tone="warn" />
        </>
      )}

      {tool === "digital_product" && (
        <>
          {Array.isArray(ai.products) &&
            ai.products.map((p: any, i: number) => (
              <Card key={i}>
                <CardBody className="p-4 space-y-2">
                  <div className="flex flex-wrap gap-2 items-center">
                    <p className="font-semibold text-gray-900">{p.name}</p>
                    <Badge variant="purple">{p.format}</Badge>
                    <Badge variant="green">{p.price_usd}</Badge>
                  </div>
                  <p className="text-sm text-gray-600">{p.promise}</p>
                  {Array.isArray(p.outline) && (
                    <ol className="list-decimal list-inside text-xs text-gray-700 space-y-0.5">
                      {p.outline.map((o: string, j: number) => (
                        <li key={j}>{o}</li>
                      ))}
                    </ol>
                  )}
                  <Bullet title="Validate" items={p.validation_steps} compact />
                  <Bullet title="Launch" items={p.launch_plan} compact />
                </CardBody>
              </Card>
            ))}
          <Bullet title="Funnel" items={ai.funnel} />
          <Bullet title="Upsells" items={ai.upsells} />
          <Bullet title="Warnings" items={ai.warnings} tone="warn" />
        </>
      )}

      {tool === "roi_tracker" && (
        <>
          <Bullet title="Insights" items={ai.insights} />
          {Array.isArray(ai.cut_or_keep) && ai.cut_or_keep.length > 0 && (
            <Card>
              <CardHeader>
                <h3 className="text-sm font-semibold">Cut / keep / increase</h3>
              </CardHeader>
              <CardBody className="space-y-2">
                {ai.cut_or_keep.map((c: any, i: number) => (
                  <div
                    key={i}
                    className="p-2.5 bg-gray-50 rounded-lg text-sm border border-gray-100"
                  >
                    <span className="font-semibold">{c.item}</span>{" "}
                    <Badge
                      variant={
                        c.action === "cut"
                          ? "red"
                          : c.action === "increase"
                            ? "green"
                            : "default"
                      }
                      className="text-[10px]"
                    >
                      {c.action}
                    </Badge>
                    <p className="text-xs text-gray-600 mt-1">{c.why}</p>
                  </div>
                ))}
              </CardBody>
            </Card>
          )}
          <Bullet title="Improve ROI" items={ai.improve_roi_actions} />
          {ai.target_next_month && (
            <Card className="border-violet-100">
              <CardBody className="p-4 text-sm">
                <p className="font-semibold text-violet-900 mb-1">
                  Next month targets
                </p>
                <p>
                  Max tool spend:{" "}
                  <strong>${ai.target_next_month.max_tool_spend_usd}</strong>
                </p>
                <p className="text-gray-600">
                  Focus: {ai.target_next_month.revenue_focus}
                </p>
              </CardBody>
            </Card>
          )}
        </>
      )}

      {tool === "brand_deals" && (
        <>
          {ai.positioning && (
            <p className="text-sm font-medium text-gray-800 p-3 bg-violet-50 rounded-lg border border-violet-100">
              {ai.positioning}
            </p>
          )}
          <Bullet title="Ideal brands" items={ai.ideal_brands} />
          {Array.isArray(ai.packages) &&
            ai.packages.map((p: any, i: number) => (
              <Card key={i}>
                <CardBody className="p-4">
                  <div className="flex flex-wrap gap-2 items-center mb-2">
                    <p className="font-semibold">{p.name}</p>
                    <Badge variant="purple">{p.price_range_usd}</Badge>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">{p.best_for}</p>
                  <ul className="space-y-1">
                    {(p.includes || []).map((x: string, j: number) => (
                      <li
                        key={j}
                        className="text-sm text-gray-700 flex gap-1.5"
                      >
                        <CheckCircle className="w-3.5 h-3.5 text-violet-500 mt-0.5 shrink-0" />
                        {x}
                      </li>
                    ))}
                  </ul>
                </CardBody>
              </Card>
            ))}
          {Array.isArray(ai.outreach_sequence) && (
            <Card>
              <CardHeader>
                <h3 className="text-sm font-semibold">Outreach sequence</h3>
              </CardHeader>
              <CardBody className="space-y-2">
                {ai.outreach_sequence.map((o: any, i: number) => (
                  <p key={i} className="text-sm text-gray-700">
                    <strong>Day {o.day}</strong> · {o.channel}: {o.message_angle}
                  </p>
                ))}
              </CardBody>
            </Card>
          )}
          <Bullet title="Contract checklist" items={ai.contract_checklist} />
          <Bullet title="Red flags" items={ai.red_flags} tone="warn" />
          {ai.sample_pitch && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <h3 className="text-sm font-semibold">Sample pitch</h3>
                <button
                  type="button"
                  onClick={() => onCopy(ai.sample_pitch)}
                  className="text-gray-400 hover:text-violet-600"
                >
                  {copied && ai.sample_pitch.startsWith(copied) ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </CardHeader>
              <CardBody>
                <pre className="text-xs whitespace-pre-wrap font-sans bg-gray-50 p-3 rounded-lg text-gray-700">
                  {ai.sample_pitch}
                </pre>
              </CardBody>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

function Bullet({
  title,
  items,
  tone = "ok",
  compact,
}: {
  title: string;
  items?: string[];
  tone?: "ok" | "warn";
  compact?: boolean;
}) {
  if (!items?.length) return null;
  if (compact) {
    return (
      <div>
        <p className="text-[10px] font-bold uppercase text-gray-400 mb-1">
          {title}
        </p>
        <ul className="space-y-0.5">
          {items.map((x, i) => (
            <li key={i} className="text-xs text-gray-600">
              · {x}
            </li>
          ))}
        </ul>
      </div>
    );
  }
  return (
    <Card>
      <CardHeader>
        <h3 className="text-sm font-semibold">{title}</h3>
      </CardHeader>
      <CardBody>
        <ul className="space-y-1.5">
          {items.map((x, i) => (
            <li key={i} className="text-sm text-gray-700 flex gap-2">
              {tone === "warn" ? (
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle className="w-4 h-4 text-violet-500 shrink-0 mt-0.5" />
              )}
              {x}
            </li>
          ))}
        </ul>
      </CardBody>
    </Card>
  );
}
