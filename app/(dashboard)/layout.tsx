export const dynamic = "force-dynamic";

import { Sidebar } from "@/components/layout/Sidebar";
import { FloatingChat } from "@/components/layout/FloatingChat";
import { FeatureGate } from "@/components/access/FeatureGate";

import { MobileMenuProvider } from "@/components/layout/MobileMenuProvider";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <MobileMenuProvider>
      <div className="flex h-screen overflow-hidden bg-gray-50">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <FeatureGate>{children}</FeatureGate>
        </main>
        <FloatingChat />
      </div>
    </MobileMenuProvider>
  );
}
