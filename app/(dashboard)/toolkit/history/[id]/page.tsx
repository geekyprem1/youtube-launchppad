import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { ToolkitResultsView } from "@/components/toolkit-engine/ToolkitResultsView";
import Link from "next/link";
import { ArrowLeft, PlaySquare, Smartphone } from "lucide-react";
import { format } from "date-fns";

export default async function ToolkitHistoryDetail({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: toolkit, error } = await supabase
    .from("toolkit_engine_history")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();

  if (error || !toolkit) {
    redirect("/toolkit/history");
  }

  // Construct the ToolkitResponse object expected by ToolkitResultsView
  const initialResult = {
    titles: toolkit.titles,
    description: toolkit.description,
    keywords: toolkit.keywords,
    tags: toolkit.tags,
    hashtags: toolkit.hashtags
  };

  return (
    <>
      <Header 
        title="Saved Toolkit" 
        subtitle={`Generated on ${format(new Date(toolkit.created_at), "MMM d, yyyy")}`}
      />
      
      <div className="p-8 max-w-5xl mx-auto space-y-6">
        
        <Link 
          href="/toolkit/history"
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to History
        </Link>
        
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Topic</p>
            <h2 className="text-2xl font-bold text-gray-900">{toolkit.topic}</h2>
          </div>
          <div className={`px-4 py-2 rounded-lg flex items-center gap-2 font-medium ${
            toolkit.video_type === "long" ? "bg-blue-50 text-blue-700" : "bg-purple-50 text-purple-700"
          }`}>
            {toolkit.video_type === "long" ? (
              <><PlaySquare className="w-5 h-5" /> Long Video</>
            ) : (
              <><Smartphone className="w-5 h-5" /> YouTube Shorts</>
            )}
          </div>
        </div>

        <ToolkitResultsView 
          initialResult={initialResult} 
          topic={toolkit.topic} 
          videoType={toolkit.video_type} 
        />
        
      </div>
    </>
  );
}
