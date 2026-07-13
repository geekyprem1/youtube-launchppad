"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { ownsOto, canAccess } from "@/lib/features";
import { PLANS, type PlanType } from "@/lib/plans";
import {
  VIP_PERKS,
  VIP_PREMIUM_TEMPLATES,
} from "@/domains/vip/premium-templates";
import {
  Crown,
  Sparkles,
  Copy,
  Check,
  Lock,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function VipPage() {
  const [loading, setLoading] = useState(true);
  const [isVip, setIsVip] = useState(false);
  const [plan, setPlan] = useState<PlanType>("free");
  const [copied, setCopied] = useState("");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        setLoading(false);
        return;
      }
      supabase
        .from("profiles")
        .select("plan_type, role, unlocked_otos")
        .eq("id", user.id)
        .single()
        .then(({ data, error }) => {
          if (error || !data) {
            supabase
              .from("profiles")
              .select("plan_type, role")
              .eq("id", user.id)
              .single()
              .then(({ data: p }) => {
                const pl =
                  p?.plan_type && p.plan_type in PLANS
                    ? (p.plan_type as PlanType)
                    : "free";
                setPlan(pl);
                setIsVip(
                  canAccess(pl, [], "vip", { isAdmin: p?.role === "admin" })
                );
                setLoading(false);
              });
            return;
          }
          const pl =
            data.plan_type && data.plan_type in PLANS
              ? (data.plan_type as PlanType)
              : "free";
          const otos = Array.isArray(data.unlocked_otos)
            ? (data.unlocked_otos as string[])
            : [];
          setPlan(pl);
          setIsVip(
            canAccess(pl, otos, "vip", { isAdmin: data.role === "admin" }) ||
              ownsOto(otos, "oto12")
          );
          setLoading(false);
        });
    });
  }, []);

  async function copyText(text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(text.slice(0, 40));
    setTimeout(() => setCopied(""), 1500);
  }

  if (loading) {
    return (
      <>
        <Header title="Infinity VIP" subtitle="Loading…" />
        <div className="p-8 text-center text-sm text-gray-500">Loading…</div>
      </>
    );
  }

  // FeatureGate should block non-VIP; keep soft fallback
  if (!isVip) {
    return (
      <>
        <Header title="Infinity VIP" subtitle="Members only" />
        <div className="p-8 max-w-md mx-auto text-center space-y-4">
          <Lock className="w-10 h-10 text-amber-500 mx-auto" />
          <h2 className="text-xl font-bold">VIP access required</h2>
          <p className="text-sm text-gray-600">
            Unlock Infinity (oto12) for premium templates and VIP perks.
          </p>
          <Link href="/upgrade?feature=vip">
            <Button className="bg-amber-500 hover:bg-amber-600 text-white">
              View Infinity OTO
            </Button>
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <Header
        title="Infinity VIP"
        subtitle="Premium templates · VIP perks · exclusive playbooks"
      />

      <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
        <Card className="overflow-hidden border-amber-200">
          <div className="bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 p-6 md:p-8 text-white">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <Crown className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-white/90 font-medium">
                    Welcome, Infinity member
                  </p>
                  <h2 className="text-2xl font-extrabold">VIP Lounge</h2>
                  <p className="text-sm text-white/90 mt-1">
                    Plan: {(PLANS[plan] ?? PLANS.free).name} · Full tool access +
                    premium packs
                  </p>
                </div>
              </div>
              <Badge className="bg-white/20 text-white border-white/30 self-start">
                <Sparkles className="w-3 h-3 mr-1 inline" />
                oto12 Infinity
              </Badge>
            </div>
          </div>
          <CardBody className="p-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {VIP_PERKS.map((p) => (
              <div
                key={p.title}
                className="p-3 rounded-xl border border-amber-100 bg-amber-50/40"
              >
                <p className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-amber-600" />
                  {p.title}
                </p>
                <p className="text-xs text-gray-600 mt-1">{p.detail}</p>
              </div>
            ))}
          </CardBody>
        </Card>

        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">
            Premium template pack
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Exclusive frameworks — copy hooks and title formulas into your
            workflow.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {VIP_PREMIUM_TEMPLATES.map((t) => (
              <Card key={t.id} className="border-amber-100">
                <CardHeader>
                  <div className="flex justify-between gap-2 items-start">
                    <div>
                      <p className="text-sm font-bold text-gray-900">{t.name}</p>
                      <Badge variant="yellow" className="text-[10px] mt-1">
                        {t.category}
                      </Badge>
                    </div>
                    <Badge variant="default" className="text-[10px]">
                      VIP
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{t.description}</p>
                </CardHeader>
                <CardBody className="space-y-3 text-sm">
                  <p className="text-xs text-gray-500">
                    <strong>Use for:</strong> {t.use_case}
                  </p>
                  <div className="p-2.5 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start gap-2">
                      <p className="text-xs text-gray-700 flex-1">
                        <span className="font-semibold">Hook: </span>
                        {t.script_hook}
                      </p>
                      <button
                        type="button"
                        onClick={() => copyText(t.script_hook)}
                        className="text-gray-400 hover:text-amber-600 shrink-0"
                      >
                        {copied && t.script_hook.startsWith(copied) ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase text-gray-400 mb-1">
                      Titles
                    </p>
                    <ul className="space-y-1">
                      {t.title_formulas.map((f) => (
                        <li
                          key={f}
                          className="text-xs text-gray-700 flex justify-between gap-2"
                        >
                          <span>· {f}</span>
                          <button
                            type="button"
                            onClick={() => copyText(f)}
                            className="text-gray-300 hover:text-amber-600"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <p className="text-xs text-gray-500">
                    <strong>Thumb:</strong> {t.thumbnail_recipe}
                  </p>
                  <p className="text-xs text-amber-800 bg-amber-50 rounded-lg px-2 py-1.5">
                    Cadence: {t.posting_cadence}
                  </p>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>

        <Card>
          <CardBody className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-gray-900">Quick jumps</p>
              <p className="text-xs text-gray-500">
                All tools unlocked — start producing.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/faceless">
                <Button size="sm" variant="secondary">
                  Faceless
                </Button>
              </Link>
              <Link href="/moneyflow">
                <Button size="sm" variant="secondary">
                  MoneyFlow
                </Button>
              </Link>
              <Link href="/profit">
                <Button size="sm" variant="secondary">
                  Profit
                </Button>
              </Link>
              <Link href="/video-engine">
                <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white">
                  Video Engine
                </Button>
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>
    </>
  );
}
