import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ChannelReportView } from "@/components/channel-engine/ChannelReportView";
import type { ChannelReport } from "@/domains/channel-engine/types";
import { Activity } from "lucide-react";

export default async function ChannelEngineHistoryDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: audit, error } = await supabase
    .from("channel_engine_audits")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();

  if (error || !audit) {
    redirect("/dashboard/history");
  }

  const report = audit.report as ChannelReport;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="max-w-7xl mx-auto w-full flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Archived Audit Report</h1>
            <p className="text-sm text-gray-500">
              Generated on {new Date(audit.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
      
      <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full flex-1">
        <ChannelReportView 
          report={report} 
          showBackToHistory={true} 
        />
      </div>
    </div>
  );
}
