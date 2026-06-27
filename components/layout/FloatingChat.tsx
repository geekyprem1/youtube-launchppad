"use client";

import { useState } from "react";
import { MessageSquare, X, Send } from "lucide-react";
import { cn } from "@/lib/utils";

export function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-xl w-80 h-96 mb-4 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4">
          <div className="bg-blue-600 p-3 flex justify-between items-center text-white">
            <span className="font-semibold text-sm flex items-center gap-2">
              <MessageSquare className="w-4 h-4" /> Ask CreatorOS
            </span>
            <button onClick={() => setIsOpen(false)} className="hover:bg-blue-700 p-1 rounded transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex-1 p-4 bg-gray-50 overflow-y-auto flex flex-col gap-3">
            <div className="bg-white p-3 rounded-xl rounded-tl-none border border-gray-100 shadow-sm text-sm text-gray-700 max-w-[85%] self-start">
              Hi! I'm your AI Strategist. You can ask me to:
              <ul className="mt-2 space-y-1 text-xs text-gray-500">
                <li>• Analyze a video title</li>
                <li>• Find a low competition topic</li>
                <li>• Explain why views dropped</li>
              </ul>
            </div>
          </div>
          
          <div className="p-3 bg-white border-t border-gray-100">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Ask me anything..." 
                className="w-full pl-3 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                <Send className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}
      
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 hover:scale-105 transition-all"
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}
