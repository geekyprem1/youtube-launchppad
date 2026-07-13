"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Youtube,
  Activity,
  Lightbulb,
  Sliders,
  TrendingUp,
  Users,
  Search,
  LogOut,
  CheckCircle,
  Clapperboard,
  Clock,
  Image as ImageIcon,
  Shield,
  Mic,
  Flame,
  Film,
  Lock,
  Sparkles,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { PLANS, type PlanType } from "@/lib/plans";
import {
  canAccess,
  type AccessFeatureKey,
} from "@/lib/features";
import { useMobileMenu } from "@/components/layout/MobileMenuProvider";

type NavItem = {
  href: string;
  icon: typeof Activity;
  label: string;
  highlight?: boolean;
  featureKey: AccessFeatureKey;
};

const nav: NavItem[] = [
  { href: "/dashboard", icon: Activity, label: "Channel Engine", featureKey: "channel_engine" },
  { href: "/dashboard/history", icon: Clock, label: "Channel Audits History", featureKey: "channel_engine" },
  { href: "/video-engine", icon: Clapperboard, label: "Video Engine", highlight: true, featureKey: "video_engine" },
  { href: "/video-engine/history", icon: Clock, label: "Generation History", featureKey: "video_engine_history" },
  { href: "/voice-studio", icon: Mic, label: "Voice Studio", highlight: true, featureKey: "voice_studio" },
  { href: "/ideas", icon: Lightbulb, label: "Recommendation Engine", highlight: true, featureKey: "ideas" },
  { href: "/toolkit", icon: Activity, label: "Toolkit Engine", highlight: true, featureKey: "toolkit" },
  { href: "/toolkit/history", icon: Clock, label: "Toolkit History", featureKey: "toolkit" },
  { href: "/thumbnail-engine", icon: ImageIcon, label: "Thumbnail Pro Engine", highlight: true, featureKey: "thumbnail_basic" },
  { href: "/thumbnail-engine/history", icon: Clock, label: "Thumbnail History", featureKey: "thumbnail_history" },
  { href: "/clickbait-thumbnail", icon: Flame, label: "Clickbait Thumbnail Maker", highlight: true, featureKey: "clickbait" },
  { href: "/video-creation-pro", icon: Film, label: "Video Creation Engine Pro", highlight: true, featureKey: "video_creation_pro" },
  { href: "/predictor", icon: CheckCircle, label: "Success Predictor", highlight: true, featureKey: "predictor" },
  { href: "/optimize", icon: Sliders, label: "Title & Thumbnail", featureKey: "optimize" },
  { href: "/retention", icon: TrendingUp, label: "Retention Analyzer", featureKey: "retention" },
  { href: "/competitors", icon: Users, label: "Competitor Intel", featureKey: "competitors" },
  { href: "/keywords", icon: Search, label: "Keyword Research", featureKey: "keywords" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [plan, setPlan] = useState<PlanType>("free");
  const [unlockedOtos, setUnlockedOtos] = useState<string[]>([]);
  const [userEmail, setUserEmail] = useState("");
  const [role, setRole] = useState("user");
  const { isOpen, setIsOpen } = useMobileMenu();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      setUserEmail(user.user_metadata?.full_name || user.email || "");

      supabase
        .from("profiles")
        .select("plan_type, role, unlocked_otos")
        .eq("id", user.id)
        .single()
        .then(({ data, error }) => {
          if (error || !data) {
            // unlocked_otos column may not exist yet — fall back
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
        });
    });
  }, []);

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  const isAdmin = role === "admin";
  const planConfig = PLANS[plan] ?? PLANS.free;

  const hasAllAccess =
    isAdmin ||
    canAccess(plan, unlockedOtos, "voice_studio", { isAdmin }) &&
      canAccess(plan, unlockedOtos, "toolkit", { isAdmin }) &&
      canAccess(plan, unlockedOtos, "predictor", { isAdmin });

  // CTA for free / fe (and partial plans) — hide when everything is already open
  const showUpgradeCta =
    !isAdmin &&
    (plan === "free" ||
      plan === "fe" ||
      plan === "starter" ||
      plan === "pro" ||
      !hasAllAccess);

  function itemUnlocked(featureKey: AccessFeatureKey) {
    return canAccess(plan, unlockedOtos, featureKey, { isAdmin });
  }

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 md:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={cn(
          "w-60 h-screen bg-white border-r border-gray-200 flex flex-col flex-shrink-0 fixed inset-y-0 left-0 z-50 md:relative transform transition-transform duration-200 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-100">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
            <Youtube className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-bold text-gray-900 text-sm">CreatorOS AI</span>
            <span
              className={`ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-semibold ${planConfig.color}`}
            >
              {planConfig.name}
            </span>
          </div>
        </div>

        <div className="px-4 py-3 border-b border-gray-100">
          <button className="w-full flex items-center justify-between gap-2 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-md text-sm text-gray-500 transition-colors">
            <span className="flex items-center gap-2">
              <Search className="w-4 h-4" /> Search AI
            </span>
            <span className="text-xs font-semibold px-1 py-0.5 bg-white border border-gray-200 rounded text-gray-400">
              ⌘K
            </span>
          </button>
        </div>

        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => setIsOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mb-2",
                pathname.startsWith("/admin")
                  ? "bg-red-50 text-red-700"
                  : "text-red-600 hover:bg-red-50 hover:text-red-700"
              )}
            >
              <Shield
                className={cn(
                  "w-4 h-4",
                  pathname.startsWith("/admin") ? "text-red-600" : "text-red-500"
                )}
              />
              Admin Panel
            </Link>
          )}

          {nav.map(({ href, icon: Icon, label, highlight, featureKey }) => {
            const unlocked = itemUnlocked(featureKey);
            // Exact match so /video-engine and /video-engine/history don't both light up
            const exactActive = pathname === href;

            if (!unlocked) {
              return (
                <Link
                  key={href}
                  href={`/upgrade?feature=${featureKey}`}
                  onClick={() => setIsOpen(false)}
                  title="Upgrade to unlock"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-50 hover:text-gray-500 transition-colors"
                >
                  <Icon className="w-4 h-4 text-gray-300" />
                  <span className="flex-1 truncate">{label}</span>
                  <Lock className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                </Link>
              );
            }

            return (
              <Link
                key={href}
                href={href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  exactActive
                    ? "bg-blue-50 text-blue-700"
                    : highlight
                      ? "text-blue-600 hover:bg-blue-50"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <Icon
                  className={cn(
                    "w-4 h-4",
                    exactActive
                      ? "text-blue-600"
                      : highlight
                        ? "text-blue-500"
                        : "text-gray-400"
                  )}
                />
                <span className="flex-1 truncate">{label}</span>
                {highlight && !exactActive && (
                  <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded font-semibold">
                    NEW
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-3 border-t border-gray-100 space-y-1">
          {userEmail && (
            <p className="px-3 text-xs text-gray-500 truncate mb-2">{userEmail}</p>
          )}
          {showUpgradeCta && (
            <Link
              href="/upgrade"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-1.5 w-full px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-sm font-bold shadow-sm hover:from-blue-700 hover:to-indigo-700 transition-colors mb-2"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Upgrade OTOs
            </Link>
          )}
          {plan === "free" && (
            <div className="px-2 mb-2 space-y-1.5">
              <p className="px-1 text-[10px] text-gray-400 leading-snug">
                Free plan — tools locked. Buy FE ($17), then admin enables your
                account.
              </p>
              <Link
                href="/upgrade?need=fe"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center w-full px-3 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-indigo-100"
              >
                Get FE access
              </Link>
            </div>
          )}
          <button
            onClick={signOut}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
          >
            <LogOut className="w-4 h-4 text-gray-400" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
