"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { cn } from "@/lib/utils";
import {
  DollarSign,
  Map,
  Gauge,
  Link2,
  Mail,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Sparkles,
  Copy,
  Check,
} from "lucide-react";

type Tab = "roadmap" | "rpm" | "affiliate" | "sponsorship" | "adsense";

const TABS: { id: Tab; label: string; icon: typeof Map; desc: string }[] = [
  { id: "roadmap", label: "Roadmap", icon: Map, desc: "90-day monetization plan" },
  { id: "rpm", label: "RPM / CPM", icon: Gauge, desc: "Revenue estimator" },
  { id: "affiliate", label: "Affiliate", icon: Link2, desc: "Offer finder" },
  { id: "sponsorship", label: "Sponsorship", icon: Mail, desc: "Pitch + rate card" },
  { id: "adsense", label: "AdSense", icon: ShieldCheck, desc: "YPP checklist" },
];

export default function MoneyFlowPage() {
  const [tab, setTab] = useState<Tab>("roadmap");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState("");

  // Shared channel fields
  const [niche, setNiche] = useState("");
  const [subs, setSubs] = useState("0");
  const [monthlyViews, setMonthlyViews] = useState("0");
  const [country, setCountry] = useState("United States");
  const [monetized, setMonetized] = useState(false);

  // Tool-specific
  const [goals, setGoals] = useState("");
  const [rpmUsd, setRpmUsd] = useState("");
  const [productsInterest, setProductsInterest] = useState("");
  const [avgViews, setAvgViews] = useState("");
  const [brandFit, setBrandFit] = useState("");
  const [watchHours12m, setWatchHours12m] = useState("0");
  const [shortsViews, setShortsViews] = useState("0");
  const [guidelinesOk, setGuidelinesOk] = useState(true);
  const [original, setOriginal] = useState(true);
  const [twoFa, setTwoFa] = useState(false);
  const [phone, setPhone] = useState(false);
  const [adsenseLinked, setAdsenseLinked] = useState(false);

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
      monetized,
    };

    let body: Record<string, unknown> = { tool: tab, ...base };

    if (tab === "roadmap") body = { ...body, goals };
    if (tab === "rpm")
      body = {
        ...body,
        rpm_usd: rpmUsd ? Number(rpmUsd) : undefined,
      };
    if (tab === "affiliate") body = { ...body, products_interest: productsInterest };
    if (tab === "sponsorship")
      body = {
        ...body,
        avg_views_per_video: avgViews ? Number(avgViews) : 0,
        brand_fit: brandFit,
      };
    if (tab === "adsense")
      body = {
        ...body,
        watch_hours_12m: Number(watchHours12m) || 0,
        shorts_views_90d: Number(shortsViews) || 0,
        community_guidelines_ok: guidelinesOk,
        original_content: original,
        two_factor: twoFa,
        phone_verified: phone,
        linked_adsense: adsenseLinked,
      };

    try {
      const res = await fetch("/api/moneyflow", {
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
    setCopied(text.slice(0, 40));
    setTimeout(() => setCopied(""), 1500);
  }

  return (
    <>
      <Header
        title="MoneyFlow"
        subtitle="Monetization roadmap · RPM tools · Affiliate · Sponsorship · AdSense"
      />

      <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
        {/* Tabs */}
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
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                    : "bg-white text-gray-600 border-gray-200 hover:border-emerald-200 hover:bg-emerald-50/50"
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{t.label}</span>
                <span className="sm:hidden">{t.label.split(" ")[0]}</span>
              </button>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-12 gap-6">
          {/* Form */}
          <div className="lg:col-span-5 space-y-4">
            <Card>
              <CardBody className="p-5 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                  <h2 className="font-bold text-gray-900">
                    {TABS.find((t) => t.id === tab)?.label}
                  </h2>
                </div>
                <p className="text-xs text-gray-500 -mt-2">
                  {TABS.find((t) => t.id === tab)?.desc}
                </p>

                <Input
                  label="Niche / channel topic *"
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  placeholder="e.g. Personal finance for beginners"
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
                <Input
                  label="Primary audience country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="United States"
                />
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={monetized}
                    onChange={(e) => setMonetized(e.target.checked)}
                    className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  Already YPP / AdSense monetized
                </label>

                {tab === "roadmap" && (
                  <Textarea
                    label="Goals (optional)"
                    value={goals}
                    onChange={(e) => setGoals(e.target.value)}
                    placeholder="e.g. Hit YPP, then first $1k/mo within 6 months"
                    rows={2}
                  />
                )}

                {tab === "rpm" && (
                  <Input
                    label="Known RPM $ (optional — leave blank to estimate)"
                    type="number"
                    value={rpmUsd}
                    onChange={(e) => setRpmUsd(e.target.value)}
                    placeholder="e.g. 4.50"
                  />
                )}

                {tab === "affiliate" && (
                  <Textarea
                    label="Products / tools you might promote"
                    value={productsInterest}
                    onChange={(e) => setProductsInterest(e.target.value)}
                    placeholder="e.g. budgeting apps, courses, VPN"
                    rows={2}
                  />
                )}

                {tab === "sponsorship" && (
                  <>
                    <Input
                      label="Avg views per video"
                      type="number"
                      value={avgViews}
                      onChange={(e) => setAvgViews(e.target.value)}
                      placeholder="e.g. 8000"
                    />
                    <Textarea
                      label="Brand fit notes"
                      value={brandFit}
                      onChange={(e) => setBrandFit(e.target.value)}
                      placeholder="What brands match your audience?"
                      rows={2}
                    />
                  </>
                )}

                {tab === "adsense" && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        label="Watch hours (12 mo)"
                        type="number"
                        value={watchHours12m}
                        onChange={(e) => setWatchHours12m(e.target.value)}
                      />
                      <Input
                        label="Shorts views (90d)"
                        type="number"
                        value={shortsViews}
                        onChange={(e) => setShortsViews(e.target.value)}
                      />
                    </div>
                    {(
                      [
                        [guidelinesOk, setGuidelinesOk, "No CG strikes"],
                        [original, setOriginal, "Mostly original content"],
                        [twoFa, setTwoFa, "2FA enabled"],
                        [phone, setPhone, "Phone verified"],
                        [adsenseLinked, setAdsenseLinked, "AdSense linked"],
                      ] as const
                    ).map(([val, set, label], i) => (
                      <label
                        key={i}
                        className="flex items-center gap-2 text-sm text-gray-700"
                      >
                        <input
                          type="checkbox"
                          checked={val}
                          onChange={(e) => set(e.target.checked)}
                          className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        {label}
                      </label>
                    ))}
                  </div>
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
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Run MoneyFlow
                </Button>
                <p className="text-[10px] text-gray-400">
                  Estimates are educational only — not earnings guarantees.
                </p>
              </CardBody>
            </Card>
          </div>

          {/* Results */}
          <div className="lg:col-span-7">
            {!loading && !result && (
              <div className="h-full min-h-[320px] flex flex-col items-center justify-center text-center p-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mb-4">
                  <DollarSign className="w-7 h-7 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Turn views into revenue strategy
                </h3>
                <p className="text-sm text-gray-500 max-w-sm">
                  Fill your niche and channel stats, then run the selected
                  MoneyFlow tool.
                </p>
              </div>
            )}

            {loading && (
              <div className="h-80 bg-white rounded-xl border border-gray-200 animate-pulse" />
            )}

            {result && !loading && (
              <div className="space-y-4">
                {result.tool === "rpm" && result.metrics && (
                  <Card className="border-emerald-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-5 text-white">
                      <p className="text-sm text-emerald-100">Estimated revenue</p>
                      <p className="text-3xl font-extrabold mt-1">
                        ${result.metrics.revenue.mid_monthly}
                        <span className="text-base font-medium text-emerald-100">
                          /mo mid
                        </span>
                      </p>
                      <p className="text-sm text-emerald-100 mt-1">
                        Range ${result.metrics.revenue.low_monthly} – $
                        {result.metrics.revenue.high_monthly} · Yearly mid $
                        {result.metrics.revenue.mid_yearly}
                      </p>
                    </div>
                    <CardBody className="p-5 grid sm:grid-cols-3 gap-3 text-center">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500">RPM low</p>
                        <p className="font-bold text-gray-900">
                          ${result.metrics.estimate.rpm_low}
                        </p>
                      </div>
                      <div className="p-3 bg-emerald-50 rounded-lg">
                        <p className="text-xs text-emerald-700">RPM mid (used)</p>
                        <p className="font-bold text-emerald-800">
                          ${result.metrics.rpm_used}
                        </p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500">RPM high</p>
                        <p className="font-bold text-gray-900">
                          ${result.metrics.estimate.rpm_high}
                        </p>
                      </div>
                      <p className="sm:col-span-3 text-xs text-gray-500">
                        {result.metrics.estimate.note}
                      </p>
                    </CardBody>
                  </Card>
                )}

                {result.tool === "adsense" && result.checklist && (
                  <Card>
                    <CardBody className="p-5 flex flex-col sm:flex-row sm:items-center gap-6">
                      <div className="text-center">
                        <ScoreRing
                          score={result.checklist.ready_score}
                          size={88}
                        />
                        <p className="text-xs text-gray-500 mt-1">Ready score</p>
                      </div>
                      <div className="flex-1">
                        <Badge
                          variant={
                            result.checklist.ypp_eligible ? "green" : "yellow"
                          }
                        >
                          {result.checklist.ypp_eligible
                            ? "Metrics path looks eligible"
                            : "Not at YPP thresholds yet"}
                        </Badge>
                        <div className="mt-3 space-y-2">
                          {result.checklist.items.map((item: any) => (
                            <div
                              key={item.id}
                              className="flex gap-2 text-sm items-start"
                            >
                              {item.status === "pass" ? (
                                <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                              ) : item.status === "warn" ? (
                                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                              ) : (
                                <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                              )}
                              <div>
                                <p className="font-medium text-gray-900">
                                  {item.label}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {item.detail}
                                </p>
                                {item.fix && (
                                  <p className="text-xs text-emerald-700">
                                    → {item.fix}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                )}

                {result.ai && (
                  <AiPanel
                    tool={result.tool}
                    ai={result.ai}
                    rateContext={result.rate_context}
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

function AiPanel({
  tool,
  ai,
  rateContext,
  onCopy,
  copied,
}: {
  tool: string;
  ai: any;
  rateContext?: any;
  onCopy: (t: string) => void;
  copied: string;
}) {
  return (
    <div className="space-y-4">
      {ai.summary && (
        <Card className="border-emerald-100 bg-emerald-50/30">
          <CardBody className="p-5">
            <p className="text-sm text-gray-800 leading-relaxed">{ai.summary}</p>
          </CardBody>
        </Card>
      )}

      {tool === "roadmap" && (
        <>
          {ai.stage && (
            <Badge variant="green" className="uppercase">
              Stage: {ai.stage}
            </Badge>
          )}
          {Array.isArray(ai.milestones) &&
            ai.milestones.map((m: any, i: number) => (
              <Card key={i}>
                <CardHeader>
                  <h3 className="text-sm font-semibold text-gray-900">
                    {m.day_range}: {m.title}
                  </h3>
                </CardHeader>
                <CardBody className="space-y-2">
                  <ul className="space-y-1">
                    {(m.actions || []).map((a: string, j: number) => (
                      <li
                        key={j}
                        className="text-sm text-gray-700 flex gap-2"
                      >
                        <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        {a}
                      </li>
                    ))}
                  </ul>
                  {m.success_metric && (
                    <p className="text-xs text-gray-500">
                      Success: {m.success_metric}
                    </p>
                  )}
                </CardBody>
              </Card>
            ))}
          {Array.isArray(ai.next_7_days) && ai.next_7_days.length > 0 && (
            <Card>
              <CardHeader>
                <h3 className="text-sm font-semibold">Next 7 days</h3>
              </CardHeader>
              <CardBody>
                <ol className="list-decimal list-inside text-sm text-gray-700 space-y-1">
                  {ai.next_7_days.map((x: string, i: number) => (
                    <li key={i}>{x}</li>
                  ))}
                </ol>
              </CardBody>
            </Card>
          )}
          {Array.isArray(ai.quick_wins) && (
            <BulletCard title="Quick wins" items={ai.quick_wins} />
          )}
          {Array.isArray(ai.risks) && (
            <BulletCard title="Risks" items={ai.risks} tone="warn" />
          )}
        </>
      )}

      {tool === "rpm" && (
        <>
          <BulletCard title="What drives RPM" items={ai.rpm_drivers} />
          <BulletCard title="Improve tips" items={ai.improve_tips} />
          {ai.seasonality_note && (
            <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded-lg">
              {ai.seasonality_note}
            </p>
          )}
          <BulletCard title="Cautions" items={ai.cautions} tone="warn" />
        </>
      )}

      {tool === "affiliate" && (
        <>
          {Array.isArray(ai.offers) &&
            ai.offers.map((o: any, i: number) => (
              <Card key={i}>
                <CardBody className="p-4 space-y-1">
                  <p className="font-semibold text-gray-900">{o.product_type}</p>
                  <p className="text-sm text-gray-600">{o.why_fit}</p>
                  <p className="text-xs text-emerald-700">
                    Promote: {o.how_to_promote}
                  </p>
                  <p className="text-xs text-gray-500">
                    Placement: {o.placement} · {o.est_commission_note}
                  </p>
                </CardBody>
              </Card>
            ))}
          <BulletCard title="Content ideas" items={ai.content_ideas} />
          {ai.disclosure_reminder && (
            <p className="text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-lg p-3">
              {ai.disclosure_reminder}
            </p>
          )}
        </>
      )}

      {tool === "sponsorship" && (
        <>
          {rateContext && (
            <p className="text-xs text-gray-500">
              Avg views context: {rateContext.avg_views?.toLocaleString?.() ?? rateContext.avg_views}
            </p>
          )}
          <BulletCard title="Media kit bullets" items={ai.media_kit_bullets} />
          {ai.rate_card && (
            <Card>
              <CardHeader>
                <h3 className="text-sm font-semibold">Rate card (ranges)</h3>
              </CardHeader>
              <CardBody className="space-y-2 text-sm">
                <p>
                  <span className="text-gray-500">Integrated:</span>{" "}
                  <strong>{ai.rate_card.integrated_mention_usd}</strong>
                </p>
                <p>
                  <span className="text-gray-500">Dedicated:</span>{" "}
                  <strong>{ai.rate_card.dedicated_video_usd}</strong>
                </p>
                <p>
                  <span className="text-gray-500">Short:</span>{" "}
                  <strong>{ai.rate_card.short_usd}</strong>
                </p>
                <p className="text-xs text-gray-500">{ai.rate_card.notes}</p>
              </CardBody>
            </Card>
          )}
          {ai.pitch_email && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <h3 className="text-sm font-semibold">Pitch email</h3>
                <button
                  type="button"
                  onClick={() => onCopy(ai.pitch_email)}
                  className="text-gray-400 hover:text-emerald-600"
                >
                  {copied && ai.pitch_email.startsWith(copied) ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </CardHeader>
              <CardBody>
                <pre className="text-xs text-gray-700 whitespace-pre-wrap font-sans bg-gray-50 p-3 rounded-lg">
                  {ai.pitch_email}
                </pre>
              </CardBody>
            </Card>
          )}
          <BulletCard title="Target brand types" items={ai.target_brand_types} />
          <BulletCard title="Negotiation tips" items={ai.negotiation_tips} />
        </>
      )}

      {tool === "adsense" && (
        <>
          {ai.eligibility_read && (
            <Badge
              variant={
                ai.eligibility_read === "eligible"
                  ? "green"
                  : ai.eligibility_read === "close"
                    ? "yellow"
                    : "red"
              }
            >
              {ai.eligibility_read}
            </Badge>
          )}
          <BulletCard title="Priority actions" items={ai.priority_actions} />
          <BulletCard title="Application tips" items={ai.application_tips} />
          <BulletCard title="After approval" items={ai.after_approval} />
          <BulletCard
            title="Policy cautions"
            items={ai.policy_cautions}
            tone="warn"
          />
        </>
      )}
    </div>
  );
}

function BulletCard({
  title,
  items,
  tone = "ok",
}: {
  title: string;
  items?: string[];
  tone?: "ok" | "warn";
}) {
  if (!items?.length) return null;
  return (
    <Card>
      <CardHeader>
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      </CardHeader>
      <CardBody>
        <ul className="space-y-1.5">
          {items.map((x, i) => (
            <li key={i} className="text-sm text-gray-700 flex gap-2 items-start">
              {tone === "warn" ? (
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              )}
              {x}
            </li>
          ))}
        </ul>
      </CardBody>
    </Card>
  );
}
