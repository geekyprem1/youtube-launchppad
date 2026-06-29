import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Calendar, FileText, CheckCircle2, Package } from "lucide-react";
import { format } from "date-fns";

export default async function HistoryDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: session, error } = await supabase
    .from("video_engine_sessions")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();

  if (error || !session) {
    redirect("/video-engine/history");
  }

  const topic = session.selected_topic || session.raw_input || "Untitled Session";
  const date = new Date(session.created_at);

  return (
    <div className="p-8 max-w-5xl mx-auto w-full">
      <Link
        href="/video-engine/history"
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-blue-600 mb-6 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" /> Back to History
      </Link>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8">
        <h1 className="text-2xl font-black text-gray-900 mb-3">{topic}</h1>
        
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-gray-400" />
            {format(date, "MMMM d, yyyy 'at' h:mm a")}
          </span>
          <span className="w-1 h-1 bg-gray-300 rounded-full" />
          <span className="font-medium bg-gray-100 px-2.5 py-1 rounded-md capitalize">
            {session.video_type?.replace("_", " ") || "Unknown Type"}
          </span>
          <span className="w-1 h-1 bg-gray-300 rounded-full" />
          <span className="font-medium bg-gray-100 px-2.5 py-1 rounded-md">
            Tone: <span className="capitalize">{session.tone || "N/A"}</span>
          </span>
        </div>
      </div>

      <div className="space-y-8">
        {/* Script Section */}
        {session.script ? (
          <section>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-blue-600" />
              Generated Script
            </h2>
            <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-6">
              {Object.entries(session.script)
                .filter(([key, val]) => typeof val === "object" && val !== null && "content" in (val as any))
                .map(([key, section]: [string, any]) => (
                  <div key={key}>
                    <h3 className="text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide border-b pb-2">
                      {section.title || key.replace("_", " ")}
                    </h3>
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-sm">
                      {section.content}
                    </p>
                  </div>
                ))}
            </div>
          </section>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center text-gray-500">
            No script generated for this session.
          </div>
        )}

        {/* Kit Section */}
        {session.kit ? (
          <section>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
              <Package className="w-5 h-5 text-purple-600" />
              Video Kit Assets
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(session.kit).map(([key, data]: [string, any]) => {
                if (!data) return null;
                return (
                  <div key={key} className="bg-white border border-gray-200 rounded-xl p-5">
                    <h3 className="text-sm font-bold text-gray-900 capitalize mb-3 pb-2 border-b">
                      {key.replace(/_/g, " ")}
                    </h3>
                    <div className="text-sm text-gray-700 max-h-60 overflow-y-auto">
                      {typeof data === "string" ? (
                        <p className="whitespace-pre-wrap">{data}</p>
                      ) : (
                        <pre className="whitespace-pre-wrap font-sans text-xs bg-gray-50 p-2 rounded">
                          {JSON.stringify(data, null, 2)}
                        </pre>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center text-gray-500">
            No kit assets generated for this session.
          </div>
        )}
      </div>
    </div>
  );
}
