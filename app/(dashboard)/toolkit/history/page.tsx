"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { createClient } from "@/lib/supabase/client";
import { Card, CardBody } from "@/components/ui/Card";
import { Search, PlaySquare, Smartphone, Clock, Trash2, ChevronRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export default function ToolkitHistoryPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchHistory();
  }, []);

  async function fetchHistory() {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { data } = await supabase
        .from("toolkit_engine_history")
        .select("id, topic, video_type, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      
      if (data) setHistory(data);
    }
    setLoading(false);
  }

  async function deleteHistory(id: string, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    
    const confirmDelete = confirm("Are you sure you want to delete this toolkit generation?");
    if (!confirmDelete) return;

    const supabase = createClient();
    await supabase.from("toolkit_engine_history").delete().eq("id", id);
    
    setHistory((prev) => prev.filter((item) => item.id !== id));
  }

  const filteredHistory = history.filter(item => 
    item.topic.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Header title="Toolkit History" subtitle="View and reuse your previously generated AI assets." />

      <div className="p-8 max-w-5xl mx-auto space-y-6">
        
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by topic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-1">No history found</h3>
            <p className="text-gray-500 text-sm">
              {searchQuery ? "No results matched your search." : "You haven't generated any toolkits yet."}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredHistory.map((item) => (
              <Link key={item.id} href={`/toolkit/history/${item.id}`}>
                <Card className="hover:border-blue-300 transition-colors cursor-pointer group shadow-sm">
                  <CardBody className="p-5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        item.video_type === "long" ? "bg-blue-100 text-blue-600" : "bg-purple-100 text-purple-600"
                      }`}>
                        {item.video_type === "long" ? <PlaySquare className="w-5 h-5" /> : <Smartphone className="w-5 h-5" />}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{item.topic}</h4>
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                          <span className="capitalize">{item.video_type} Video</span>
                          <span>•</span>
                          {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => deleteHistory(item.id, e)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </CardBody>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
