"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Coins, Infinity as InfinityIcon, Clapperboard } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { PLANS, type PlanType } from "@/lib/plans";
import { cn } from "@/lib/utils";

type CreditsState = {
  loading: boolean;
  credits: number | null;
  aiVideoCredits: number;
  unlimited: boolean;
  planName: string;
  planType: PlanType;
};

function computeUnlimited(
  planType: string,
  _unlockedOtos: string[]
): boolean {
  // Only legacy internal high-tier plans are unlimited. All OTOs use lifetime credit pools.
  return ["pro", "elite", "creator_pro", "ultimate"].includes(planType);
}

/**
 * Shows video-engine lifetime credits (or Unlimited) for the logged-in user.
 * Used in Header + Sidebar so credits are always visible.
 */
export function CreditsBadge({
  compact = false,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  const [state, setState] = useState<CreditsState>({
    loading: true,
    credits: null,
    aiVideoCredits: 0,
    unlimited: false,
    planName: "Free",
    planType: "free",
  });

  const load = useCallback(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        setState((s) => ({ ...s, loading: false }));
        return;
      }

      supabase
        .from("profiles")
        .select("video_engine_credits, ai_video_credits, plan_type, unlocked_otos")
        .eq("id", user.id)
        .single()
        .then(({ data, error }) => {
          if (error || !data) {
            supabase
              .from("profiles")
              .select("video_engine_credits, plan_type")
              .eq("id", user.id)
              .single()
              .then(({ data: partial }) => {
                const planType =
                  partial?.plan_type && partial.plan_type in PLANS
                    ? (partial.plan_type as PlanType)
                    : "free";
                const unlimited = computeUnlimited(planType, []);
                setState({
                  loading: false,
                  credits:
                    typeof partial?.video_engine_credits === "number"
                      ? partial.video_engine_credits
                      : null,
                  aiVideoCredits: 0,
                  unlimited,
                  planName: (PLANS[planType] ?? PLANS.free).name,
                  planType,
                });
              });
            return;
          }

          const planType =
            data.plan_type && data.plan_type in PLANS
              ? (data.plan_type as PlanType)
              : "free";
          const otos = Array.isArray(data.unlocked_otos)
            ? (data.unlocked_otos as string[])
            : [];
          const unlimited = computeUnlimited(planType, otos);
          setState({
            loading: false,
            credits:
              typeof data.video_engine_credits === "number"
                ? data.video_engine_credits
                : null,
            aiVideoCredits:
              typeof data.ai_video_credits === "number"
                ? data.ai_video_credits
                : 0,
            unlimited,
            planName: (PLANS[planType] ?? PLANS.free).name,
            planType,
          });
        });
    });
  }, []);

  useEffect(() => {
    load();
    // Refresh when tab regains focus (after generations)
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [load]);

  if (state.loading) {
    return (
      <div
        className={cn(
          "h-8 w-24 rounded-full bg-gray-100 animate-pulse",
          className
        )}
      />
    );
  }

  const low =
    !state.unlimited &&
    typeof state.credits === "number" &&
    state.credits <= 10;
  const empty =
    !state.unlimited &&
    typeof state.credits === "number" &&
    state.credits <= 0;

  const inner = (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-semibold transition-colors",
        compact ? "px-2 py-1 text-[11px]" : "px-3 py-1.5 text-xs",
        empty
          ? "bg-red-50 border-red-200 text-red-700"
          : low
            ? "bg-amber-50 border-amber-200 text-amber-800"
            : state.unlimited
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-indigo-50 border-indigo-200 text-indigo-800",
        className
      )}
      title={
        state.unlimited
          ? "Unlimited Video Engine generations on your plan / OTO"
          : "Lifetime Engine lifetime credits — used for topics, hooks, scripts, kit"
      }
    >
      {state.unlimited ? (
        <>
          <InfinityIcon className={compact ? "w-3 h-3" : "w-3.5 h-3.5"} />
          <span>Unlimited</span>
        </>
      ) : (
        <>
          <Coins className={compact ? "w-3 h-3" : "w-3.5 h-3.5"} />
          <span>
            {typeof state.credits === "number" ? state.credits : "—"}{" "}
            {compact ? "cr" : "credits"}
          </span>
        </>
      )}
    </div>
  );

  // Separate AI-video clip counter (only shown when the user has an allotment)
  const videoBadge =
    state.aiVideoCredits > 0 ? (
      <div
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border font-semibold",
          compact ? "px-2 py-1 text-[11px]" : "px-3 py-1.5 text-xs",
          "bg-purple-50 border-purple-200 text-purple-800"
        )}
        title="AI video clips left (10s 720p each)"
      >
        <Clapperboard className={compact ? "w-3 h-3" : "w-3.5 h-3.5"} />
        <span>
          {state.aiVideoCredits} {compact ? "clip" : "video clips"}
        </span>
      </div>
    ) : null;

  // Low credits → soft link to upgrade
  const creditNode =
    !state.unlimited && (low || empty) ? (
      <Link href="/upgrade" className="hover:opacity-90">
        {inner}
      </Link>
    ) : (
      inner
    );

  if (!videoBadge) return creditNode;

  return (
    <div className="inline-flex items-center gap-1.5">
      {creditNode}
      {videoBadge}
    </div>
  );
}

/** Compact plan + credits block for Header right side */
export function UserCreditsBar({ className }: { className?: string }) {
  const [planName, setPlanName] = useState("…");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase
        .from("profiles")
        .select("plan_type")
        .eq("id", user.id)
        .single()
        .then(({ data }) => {
          const p =
            data?.plan_type && data.plan_type in PLANS
              ? (data.plan_type as PlanType)
              : "free";
          setPlanName((PLANS[p] ?? PLANS.free).name);
        });
    });
  }, []);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <CreditsBadge />
      <span className="hidden md:inline text-[11px] text-gray-400 font-medium">
        {planName}
      </span>
    </div>
  );
}
