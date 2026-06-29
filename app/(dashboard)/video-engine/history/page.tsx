import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Clapperboard, Calendar, ChevronRight, FileText, CheckCircle2 } from "lucide-react";

export default async function HistoryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch all sessions for this user, ordered by newest first
  const { data: sessions, error } = await supabase
    .from("video_engine_sessions")
    .select("id, selected_topic, raw_input, video_type, created_at, script")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch history:", error);
  }

  return (
    <div className="p-8 max-w-5xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
          <Clapperboard className="w-8 h-8 text-blue-600" />
          Generation History
        </h1>
        <p className="text-gray-500 mt-2 text-lg">
          View your past AI Video Engine sessions, scripts, and kits.
        </p>
      </div>

      <div className="grid gap-4">
        {(!sessions || sessions.length === 0) ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">No history yet</h3>
            <p className="text-gray-500 mt-1 mb-6">You haven't generated any videos yet.</p>
            <Link
              href="/video-engine"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
            >
              Start Generating
            </Link>
          </div>
        ) : (
          sessions.map((session) => {
            const hasScript = !!session.script;
            const topic = session.selected_topic || session.raw_input || "Untitled Session";
            const date = new Date(session.created_at);
            
            return (
              <Link
                key={session.id}
                href={`/video-engine/history/${session.id}`}
                className="group block bg-white border border-gray-200 hover:border-blue-300 rounded-2xl p-5 transition-all hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-lg text-gray-900 line-clamp-1 group-hover:text-blue-700 transition-colors">
                        {topic}
                      </h3>
                      {hasScript && (
                        <span className="flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" /> Completed
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        {formatDistanceToNow(date, { addSuffix: true })}
                      </span>
                      {session.video_type && (
                        <>
                          <span className="w-1 h-1 bg-gray-300 rounded-full" />
                          <span className="capitalize">{session.video_type.replace("_", " ")}</span>
                        </>
                      )}
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
