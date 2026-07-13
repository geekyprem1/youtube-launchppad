"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Lock, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { PLANS, type PlanType } from "@/lib/plans";
import {
  canAccess,
  FEATURE_LABELS,
  featureKeyFromPath,
  type AccessFeatureKey,
} from "@/lib/features";
import { Button } from "@/components/ui/Button";
import { usePathname } from "next/navigation";

type AccessState = {
  loading: boolean;
  allowed: boolean;
  featureKey: AccessFeatureKey | null;
  plan: PlanType;
};

/**
 * Client-side hard gate for dashboard pages.
 * When pathname maps to a locked feature, blocks content with upgrade CTA.
 * Paths with no feature mapping (admin, upgrade, pricing, coach) pass through.
 */
export function FeatureGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const featureKey = featureKeyFromPath(pathname || "");

  const [state, setState] = useState<AccessState>({
    loading: true,
    allowed: true,
    featureKey: null,
    plan: "free",
  });

  useEffect(() => {
    // No mapped feature → allow (upgrade, admin, coach, etc.)
    if (!featureKey) {
      setState({
        loading: false,
        allowed: true,
        featureKey: null,
        plan: "free",
      });
      return;
    }

    let cancelled = false;
    setState((s) => ({ ...s, loading: true, featureKey }));

    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user || cancelled) {
        if (!cancelled) {
          setState({
            loading: false,
            allowed: false,
            featureKey,
            plan: "free",
          });
        }
        return;
      }

      supabase
        .from("profiles")
        .select("plan_type, role, unlocked_otos")
        .eq("id", user.id)
        .single()
        .then(({ data, error }) => {
          if (cancelled) return;

          const apply = (
            planType: string | null | undefined,
            role: string | null | undefined,
            otos: string[] | null | undefined
          ) => {
            const plan =
              planType && planType in PLANS
                ? (planType as PlanType)
                : ("free" as PlanType);
            const isAdmin = role === "admin";
            const unlocked = Array.isArray(otos) ? otos : [];
            const allowed = canAccess(plan, unlocked, featureKey, { isAdmin });
            setState({ loading: false, allowed, featureKey, plan });
          };

          if (error || !data) {
            supabase
              .from("profiles")
              .select("plan_type, role")
              .eq("id", user.id)
              .single()
              .then(({ data: partial }) => {
                if (cancelled) return;
                apply(partial?.plan_type, partial?.role, []);
              });
            return;
          }

          apply(
            data.plan_type,
            data.role,
            Array.isArray(data.unlocked_otos)
              ? (data.unlocked_otos as string[])
              : []
          );
        });
    });

    return () => {
      cancelled = true;
    };
  }, [featureKey, pathname]);

  // Paths that never gate
  if (!featureKey) return <>{children}</>;

  if (state.loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh] text-sm text-gray-500">
        Checking access…
      </div>
    );
  }

  if (state.allowed) return <>{children}</>;

  const label =
    (state.featureKey && FEATURE_LABELS[state.featureKey]) || "This feature";
  const planName = (PLANS[state.plan] ?? PLANS.free).name;
  const isFree = state.plan === "free";
  // Free has no tools open — don't send them to Video Engine
  const primaryHref = isFree
    ? "/upgrade?need=fe"
    : `/upgrade?feature=${encodeURIComponent(state.featureKey || "")}`;
  const primaryLabel = isFree ? "Get FE access" : "Upgrade to unlock";

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-6">
      <div className="max-w-md w-full text-center rounded-2xl border border-gray-200 bg-white shadow-sm p-8 space-y-4">
        <div className="mx-auto w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center">
          <Lock className="w-6 h-6 text-indigo-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">{label} is locked</h2>
        <p className="text-sm text-gray-600">
          {isFree ? (
            <>
              Your account is on <strong>Free</strong>. Buy{" "}
              <strong>FE (FrontEnd)</strong> on LaunchPadJV ($17) for Video
              Engine + Basic Thumbnail, then contact support/admin so they can
              set your plan. OTOs unlock extra tools after FE.
            </>
          ) : (
            <>
              Your plan is <strong>{planName}</strong>. Buy the matching OTO on
              LaunchPadJV, then admin unlocks this module after payment (no
              auto-unlock).
            </>
          )}
        </p>
        <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
          <Link href={primaryHref}>
            <Button className="w-full sm:w-auto">
              <Sparkles className="w-4 h-4" />
              {primaryLabel}
            </Button>
          </Link>
          {!isFree && (
            <Link href="/video-engine">
              <Button variant="secondary" className="w-full sm:w-auto">
                Go to Video Engine
              </Button>
            </Link>
          )}
          {isFree && (
            <Link href="/upgrade">
              <Button variant="secondary" className="w-full sm:w-auto">
                View all OTOs
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
