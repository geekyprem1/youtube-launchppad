"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { Menu } from "lucide-react";
import { useMobileMenu } from "@/components/layout/MobileMenuProvider";
import { UserCreditsBar } from "@/components/layout/CreditsBadge";
import { PLANS, type PlanType } from "@/lib/plans";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [planName, setPlanName] = useState("…");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (!data.user) return;
      supabase
        .from("profiles")
        .select("plan_type")
        .eq("id", data.user.id)
        .single()
        .then(({ data: profile }) => {
          const p =
            profile?.plan_type && profile.plan_type in PLANS
              ? (profile.plan_type as PlanType)
              : "free";
          setPlanName((PLANS[p] ?? PLANS.free).name);
        });
    });
  }, []);

  const { setIsOpen } = useMobileMenu();

  return (
    <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-4 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={() => setIsOpen(true)}
          className="md:hidden p-1.5 -ml-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors shrink-0"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="min-w-0">
          <h1 className="text-lg font-semibold text-gray-900 leading-tight truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-gray-500 hidden sm:block truncate">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {user && (
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <UserCreditsBar />
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-gray-900 max-w-[140px] truncate">
              {user.user_metadata?.full_name || user.email}
            </p>
            <p className="text-xs text-gray-500">{planName}</p>
          </div>
          <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
            {(user.user_metadata?.full_name || user.email || "U")[0].toUpperCase()}
          </div>
        </div>
      )}
    </header>
  );
}
