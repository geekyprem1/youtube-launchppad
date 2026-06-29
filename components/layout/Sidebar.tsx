"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Youtube, LayoutDashboard, Activity, Lightbulb,
  Sliders, TrendingUp, Users, Search, LogOut, CheckCircle, Clapperboard, Clock, Image as ImageIcon
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { PLANS, type PlanType } from "@/lib/plans";

const nav = [
  { href: "/dashboard", icon: Activity, label: "Channel Engine" },
  { href: "/dashboard/history", icon: Clock, label: "Channel Audits History" },
  { href: "/video-engine", icon: Clapperboard, label: "Video Engine", highlight: true },
  { href: "/video-engine/history", icon: Clock, label: "Generation History" },
  { href: "/ideas", icon: Lightbulb, label: "Recommendation Engine", highlight: true },
  { href: "/toolkit", icon: Activity, label: "Toolkit Engine", highlight: true },
  { href: "/toolkit/history", icon: Clock, label: "Toolkit History" },
  { href: "/thumbnail-engine", icon: ImageIcon, label: "Thumbnail Pro Engine", highlight: true },
  { href: "/thumbnail-engine/history", icon: Clock, label: "Thumbnail History" },
  { href: "/predictor", icon: CheckCircle, label: "Success Predictor", highlight: true },
  { href: "/optimize", icon: Sliders, label: "Title & Thumbnail" },
  { href: "/retention", icon: TrendingUp, label: "Retention Analyzer" },
  { href: "/competitors", icon: Users, label: "Competitor Intel" },
  { href: "/keywords", icon: Search, label: "Keyword Research" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [plan, setPlan] = useState<PlanType>("free");
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserEmail(user.user_metadata?.full_name || user.email || "");
        // Fetch plan
        supabase.from("profiles").select("plan_type").eq("id", user.id).single()
          .then(({ data }) => { if (data?.plan_type) setPlan(data.plan_type as PlanType); });
      }
    });
  }, []);

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  const planConfig = PLANS[plan];

  return (
    <aside className="w-60 h-screen bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-100">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
          <Youtube className="w-4 h-4 text-white" />
        </div>
        <div>
          <span className="font-bold text-gray-900 text-sm">CreatorOS AI</span>
          <span className={`ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-semibold ${planConfig.color}`}>
            {planConfig.name}
          </span>
        </div>
      </div>

      {/* Search Trigger */}
      <div className="px-4 py-3 border-b border-gray-100">
        <button className="w-full flex items-center justify-between gap-2 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-md text-sm text-gray-500 transition-colors">
          <span className="flex items-center gap-2"><Search className="w-4 h-4" /> Search AI</span>
          <span className="text-xs font-semibold px-1 py-0.5 bg-white border border-gray-200 rounded text-gray-400">⌘K</span>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {nav.map(({ href, icon: Icon, label, highlight }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-blue-50 text-blue-700"
                  : highlight
                    ? "text-blue-600 hover:bg-blue-50"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <Icon className={cn("w-4 h-4", active ? "text-blue-600" : highlight ? "text-blue-500" : "text-gray-400")} />
              {label}
              {highlight && !active && (
                <span className="ml-auto text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded font-semibold">
                  NEW
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User + Sign out */}
      <div className="px-3 py-3 border-t border-gray-100 space-y-1">
        {userEmail && (
          <p className="px-3 text-xs text-gray-500 truncate">{userEmail}</p>
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
  );
}
