import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Activity, Calendar, ChevronRight, CheckCircle2 } from "lucide-react";

export default async function ChannelEngineHistoryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch all sessions for this user, ordered by newest first
  const { data: audits, error } = await supabase
    .from("channel_engine_audits")
    .select("id, channel_name, channel_url, overall_score, analysis_type, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="p-8 max-w-5xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
          <Activity className="w-8 h-8 text-blue-600" />
          Channel Audits History
        </h1>
        <p className="text-gray-500 mt-2 text-lg">
          Review your past AI Channel Engine audits and scorecards.
        </p>
      </div>

      <div className="grid gap-4">
        {(!audits || audits.length === 0) ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Activity className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">No audits yet</h3>
            <p className="text-gray-500 mt-1 mb-6">You haven't run any channel audits yet.</p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
            >
              Analyze a Channel
            </Link>
          </div>
        ) : (
          audits.map((audit) => {
            const date = new Date(audit.created_at);
            
            return (
              <Link
                key={audit.id}
                href={`/dashboard/history/${audit.id}`}
                className="group block bg-white border border-gray-200 hover:border-blue-300 rounded-2xl p-5 transition-all hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-lg text-gray-900 line-clamp-1 group-hover:text-blue-700 transition-colors">
                        {audit.channel_name || audit.channel_url}
                      </h3>
                      {audit.analysis_type === 'ai_smart' && (
                        <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
                          AI Smart Audit
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        {formatDistanceToNow(date, { addSuffix: true })}
                      </span>
                      <span className="w-1 h-1 bg-gray-300 rounded-full" />
                      <span className="font-bold text-gray-900">Score: {audit.overall_score}/100</span>
                    </div>
                  </div>
                  
                  <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-blue-50 transition-colors flex-shrink-0">
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
