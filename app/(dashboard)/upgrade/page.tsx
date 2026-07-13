"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ExternalLink, Check, Lock, Sparkles } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { PLANS, type PlanType } from "@/lib/plans";
import {
  OTO_CATALOG,
  FEATURE_LABELS,
  ownsOto,
  getOtosForFeature,
  canAccess,
  type AccessFeatureKey,
  type OtoProduct,
} from "@/lib/features";
import { getOtoUrl, getFePurchaseUrl } from "@/lib/oto-links";
import { cn } from "@/lib/utils";

function unlockLabels(oto: OtoProduct): string[] {
  if (oto.unlocks === "all") return ["All features"];
  return oto.unlocks.map((k) => FEATURE_LABELS[k] || k);
}

function UpgradeContent() {
  const searchParams = useSearchParams();
  const featureParam = searchParams.get("feature") as AccessFeatureKey | null;
  const needFe = searchParams.get("need") === "fe";

  const [plan, setPlan] = useState<PlanType>("free");
  const [unlockedOtos, setUnlockedOtos] = useState<string[]>([]);
  const [role, setRole] = useState("user");
  const [loading, setLoading] = useState(true);

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
              .then(({ data: partial }) => {
                if (partial?.plan_type && partial.plan_type in PLANS) {
                  setPlan(partial.plan_type as PlanType);
                }
                if (partial?.role) setRole(partial.role);
                setLoading(false);
              });
            return;
          }
          if (data.plan_type && data.plan_type in PLANS) {
            setPlan(data.plan_type as PlanType);
          }
          if (data.role) setRole(data.role);
          if (Array.isArray(data.unlocked_otos)) {
            setUnlockedOtos(data.unlocked_otos as string[]);
          }
          setLoading(false);
        });
    });
  }, []);

  const isAdmin = role === "admin";
  const feUrl = getFePurchaseUrl();
  const planName = (PLANS[plan] ?? PLANS.free).name;

  const highlightedOtoIds = useMemo(() => {
    if (!featureParam) return new Set<string>();
    return new Set(getOtosForFeature(featureParam).map((o) => o.id));
  }, [featureParam]);

  const featureLabel =
    featureParam && FEATURE_LABELS[featureParam]
      ? FEATURE_LABELS[featureParam]
      : null;

  const alreadyHasFeature =
    featureParam &&
    canAccess(plan, unlockedOtos, featureParam, { isAdmin });

  return (
    <>
      <Header
        title="Upgrade OTOs"
        subtitle="Buy add-ons on LaunchPadJV — admin unlocks access after payment"
      />

      <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
        <div className="rounded-xl border border-indigo-100 bg-gradient-to-r from-indigo-50 to-blue-50 px-5 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-indigo-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Your plan: {planName}
                {isAdmin && (
                  <span className="text-[10px] uppercase bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold">
                    Admin
                  </span>
                )}
              </p>
              <p className="text-xs text-indigo-700/80 mt-1">
                Payment is external (LaunchPadJV). After you buy, support/admin
                enables the OTO on your account — no auto-unlock.
              </p>
            </div>
            {loading && (
              <span className="text-xs text-indigo-500">Loading access…</span>
            )}
          </div>

          {featureLabel && (
            <p className="mt-3 text-sm text-indigo-800">
              {alreadyHasFeature ? (
                <>
                  <Check className="w-4 h-4 inline mr-1 text-emerald-600" />
                  You already have access to <strong>{featureLabel}</strong>.
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 inline mr-1" />
                  Unlocking <strong>{featureLabel}</strong> — matching OTOs are
                  highlighted below.
                </>
              )}
            </p>
          )}
        </div>

        {(plan === "free" || needFe) && !isAdmin && (
          <Card className="border-emerald-200 bg-emerald-50/40">
            <CardBody className="p-6 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  FrontEnd (FE) — $17
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Base access: Video Engine core + Basic Thumbnail Engine (100
                  lifetime credits). Everything else stays locked until you add
                  OTOs.
                </p>
              </div>
              {feUrl ? (
                <a
                  href={feUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0"
                >
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                    Buy FE
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </a>
              ) : (
                <Button disabled variant="secondary">
                  Link coming soon
                </Button>
              )}
            </CardBody>
          </Card>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {OTO_CATALOG.map((oto) => {
            const owned = ownsOto(unlockedOtos, oto.id) || isAdmin;
            const url = getOtoUrl(oto.id);
            const available = Boolean(url);
            const highlight = highlightedOtoIds.has(oto.id);
            const labels = unlockLabels(oto);

            return (
              <Card
                key={oto.id}
                className={cn(
                  "flex flex-col transition-all",
                  highlight &&
                    "ring-2 ring-indigo-500 border-indigo-200 shadow-md",
                  owned && "bg-gray-50/80",
                  oto.id === "oto12" && !owned && "border-purple-200"
                )}
              >
                <CardBody className="p-5 flex flex-col h-full">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        {oto.id}
                      </p>
                      <h3 className="text-base font-bold text-gray-900 leading-tight">
                        {oto.name}
                      </h3>
                    </div>
                    {owned ? (
                      <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 border border-emerald-200 px-2 py-1 rounded-full">
                        Owned
                      </span>
                    ) : highlight ? (
                      <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700 border border-indigo-200 px-2 py-1 rounded-full">
                        Matches
                      </span>
                    ) : null}
                  </div>

                  <p className="text-2xl font-extrabold text-gray-900 mb-2">
                    ${oto.price}
                  </p>
                  <p className="text-sm text-gray-600 mb-4 flex-1">
                    {oto.description}
                  </p>

                  <ul className="space-y-1.5 mb-5">
                    {labels.map((label) => (
                      <li
                        key={label}
                        className="flex items-center text-xs font-medium text-gray-700"
                      >
                        <Check className="w-3.5 h-3.5 mr-2 text-blue-500 shrink-0" />
                        {label}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto">
                    {owned ? (
                      <Button disabled variant="secondary" className="w-full">
                        Already owned
                      </Button>
                    ) : available && url ? (
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full"
                      >
                        <Button
                          className={cn(
                            "w-full text-white",
                            oto.id === "oto12"
                              ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                              : ""
                          )}
                        >
                          Buy on LaunchPadJV
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </a>
                    ) : (
                      <Button disabled variant="secondary" className="w-full">
                        Link coming soon
                      </Button>
                    )}
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>

        <p className="text-center text-xs text-gray-400 pb-4">
          After purchase, contact support or wait for admin to add the OTO on
          your profile. Access is not automatic.
        </p>
      </div>
    </>
  );
}

export default function UpgradePage() {
  return (
    <Suspense
      fallback={
        <>
          <Header title="Upgrade OTOs" subtitle="Loading…" />
          <div className="p-8 text-sm text-gray-500 text-center">Loading…</div>
        </>
      }
    >
      <UpgradeContent />
    </Suspense>
  );
}
