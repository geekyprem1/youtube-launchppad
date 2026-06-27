"use client";

import { useState, useRef, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Send, User, Bot, Loader2, Sparkles, AlertTriangle } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface Message {
  role: "user" | "assistant";
  content: string;
  suggested_actions?: Array<{ label: string; action: string }>;
}

export default function CoachPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm your AI YouTube Coach. I've analyzed your recent channel performance and noticed you're a bit behind on your upload schedule. What would you like to focus on today?"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [contextScore, setContextScore] = useState<number | null>(null);
  
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(text: string) {
    if (!text.trim()) return;
    
    const newMessages: Message[] = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/coach/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content }))
        }),
      });
      const data = await res.json();
      
      if (data.analysis) {
        setMessages(prev => [
          ...prev, 
          { 
            role: "assistant", 
            content: data.analysis.reply,
            suggested_actions: data.analysis.suggested_actions
          }
        ]);
        if (data.metrics?.context_score !== undefined) {
          setContextScore(data.metrics.context_score);
        }
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I had an error processing that request." }]);
    } finally {
      setLoading(false);
    }
  }

  const handleActionClick = (actionText: string) => {
    sendMessage(`I want to: ${actionText}`);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50/30">
      <Header title="AI Coach" subtitle="Your personalized guide to growing your YouTube channel." />
      
      <div className="p-8 max-w-5xl mx-auto w-full flex-1 flex flex-col gap-6">
        
        {contextScore !== null && (
          <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${contextScore > 75 ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                {contextScore > 75 ? <AlertTriangle className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">Context Urgency</h3>
                <p className="text-xs text-gray-500">Based on your recent channel activity and unresolved diagnostics.</p>
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">{contextScore}<span className="text-sm font-normal text-gray-500">/100</span></div>
          </div>
        )}

        <Card className="flex-1 border-gray-200 shadow-sm flex flex-col overflow-hidden min-h-[500px]">
          <CardBody className="flex-1 p-0 flex flex-col h-full bg-white relative">
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-4 ${msg.role === "assistant" ? "flex-row" : "flex-row-reverse"}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${msg.role === "assistant" ? "bg-purple-100 text-purple-600" : "bg-gray-100 text-gray-600"}`}>
                    {msg.role === "assistant" ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
                  </div>
                  <div className={`max-w-[80%] flex flex-col ${msg.role === "assistant" ? "items-start" : "items-end"}`}>
                    <div className={`p-4 rounded-2xl text-sm leading-relaxed ${msg.role === "assistant" ? "bg-gray-50 text-gray-800 border border-gray-100 rounded-tl-none" : "bg-blue-600 text-white rounded-tr-none"}`}>
                      {msg.content}
                    </div>
                    
                    {msg.suggested_actions && msg.suggested_actions.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {msg.suggested_actions.map((action, j) => (
                          <button
                            key={j}
                            onClick={() => handleActionClick(action.action)}
                            className="bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-semibold px-3 py-1.5 rounded-full transition-colors border border-purple-100 shadow-sm"
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex gap-4 flex-row">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-purple-100 text-purple-600">
                    <Loader2 className="w-5 h-5 animate-spin" />
                  </div>
                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 rounded-tl-none text-sm text-gray-500">
                    Thinking...
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <div className="p-4 border-t border-gray-100 bg-white">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !loading) {
                      sendMessage(input);
                    }
                  }}
                  placeholder="Ask your coach anything..."
                  className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                />
                <Button 
                  disabled={loading || !input.trim()} 
                  onClick={() => sendMessage(input)}
                  className="px-6 rounded-xl bg-blue-600 hover:bg-blue-700"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
