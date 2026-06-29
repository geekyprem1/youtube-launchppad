"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { createClient } from "@/lib/supabase/client";
import { Card, CardBody } from "@/components/ui/Card";
import { Search, PlaySquare, Smartphone, Clock, Trash2, ChevronRight, Loader2, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export default function ThumbnailHistoryPage() {
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
        .from("thumbnail_engine_history")
        .select("id, user_input, video_type, created_at, image_url")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      
      if (data) setHistory(data);
    }
    setLoading(false);
  }

  async function deleteHistory(id: string, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    
    const confirmDelete = confirm("Are you sure you want to delete this thumbnail?");
    if (!confirmDelete) return;

    const supabase = createClient();
    await supabase.from("thumbnail_engine_history").delete().eq("id", id);
    
    setHistory((prev) => prev.filter((item) => item.id !== id));
  }

  const filteredHistory = history.filter(item => 
    item.user_input.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Header title="Thumbnail History" subtitle="View and reuse your previously generated AI thumbnails." />

      <div className="p-8 max-w-5xl mx-auto space-y-6">
        
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search thumbnails..."
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
            <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-1">No history found</h3>
            <p className="text-gray-500 text-sm">
              {searchQuery ? "No results matched your search." : "You haven't generated any thumbnails yet."}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredHistory.map((item) => (
              <Link key={item.id} href={`/thumbnail-engine/history/${item.id}`}>
                <Card className="hover:border-blue-300 transition-colors cursor-pointer group shadow-sm overflow-hidden h-full flex flex-col">
                  <div className="relative h-48 bg-gray-900 overflow-hidden border-b border-gray-100">
                    <img 
                      src={item.image_url} 
                      alt={item.user_input}
                      className={`w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity group-hover:scale-105 duration-300`}
                    />
                    <div className="absolute top-2 right-2 flex gap-1">
                      <span className="px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold rounded flex items-center gap-1">
                        {item.video_type === "long" ? <PlaySquare className="w-3 h-3" /> : <Smartphone className="w-3 h-3" />}
                        {item.video_type === "long" ? "16:9" : "9:16"}
                      </span>
                    </div>
                  </div>
                  <CardBody className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                        <Clock className="w-3 h-3" /> 
                        {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                      </p>
                      <h4 className="font-semibold text-gray-900 text-sm line-clamp-2">{item.user_input}</h4>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-xs font-semibold text-blue-600 group-hover:underline flex items-center gap-1">
                        View Details <ChevronRight className="w-3 h-3" />
                      </span>
                      <button 
                        onClick={(e) => deleteHistory(item.id, e)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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
