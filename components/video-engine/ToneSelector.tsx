"use client";

import { cn } from "@/lib/utils";
import { Tone } from "@/domains/video-engine/types";

const TONES: { value: Tone; label: string; icon: string; desc: string; color: string }[] = [
  { value: "professional",  label: "Professional",  icon: "💼", desc: "Authoritative & data-driven",    color: "border-slate-300 hover:border-slate-500" },
  { value: "funny",         label: "Funny",          icon: "😂", desc: "Witty, humorous & light",        color: "border-yellow-300 hover:border-yellow-500" },
  { value: "emotional",     label: "Emotional",      icon: "❤️", desc: "Empathetic & heart-centred",     color: "border-rose-300 hover:border-rose-500" },
  { value: "motivational",  label: "Motivational",   icon: "🔥", desc: "High-energy & action-driving",   color: "border-orange-300 hover:border-orange-500" },
  { value: "educational",   label: "Educational",    icon: "🎓", desc: "Clear, structured & teaching",   color: "border-blue-300 hover:border-blue-500" },
  { value: "storytelling",  label: "Storytelling",   icon: "📖", desc: "Narrative-first, story-driven",  color: "border-purple-300 hover:border-purple-500" },
  { value: "aggressive",    label: "Aggressive",     icon: "⚡", desc: "Bold, provocative & direct",     color: "border-red-300 hover:border-red-500" },
  { value: "luxury",        label: "Luxury",         icon: "👑", desc: "Premium & aspirational voice",   color: "border-amber-300 hover:border-amber-500" },
];

const SELECTED_COLORS: Record<Tone, string> = {
  professional:  "border-slate-600 bg-slate-50 shadow-slate-100",
  funny:         "border-yellow-500 bg-yellow-50 shadow-yellow-100",
  emotional:     "border-rose-500 bg-rose-50 shadow-rose-100",
  motivational:  "border-orange-500 bg-orange-50 shadow-orange-100",
  educational:   "border-blue-600 bg-blue-50 shadow-blue-100",
  storytelling:  "border-purple-500 bg-purple-50 shadow-purple-100",
  aggressive:    "border-red-600 bg-red-50 shadow-red-100",
  luxury:        "border-amber-500 bg-amber-50 shadow-amber-100",
};

const LABEL_COLORS: Record<Tone, string> = {
  professional:  "text-slate-700",
  funny:         "text-yellow-700",
  emotional:     "text-rose-700",
  motivational:  "text-orange-700",
  educational:   "text-blue-700",
  storytelling:  "text-purple-700",
  aggressive:    "text-red-700",
  luxury:        "text-amber-700",
};

interface ToneSelectorProps {
  selected: Tone | null;
  onSelect: (tone: Tone) => void;
}

export function ToneSelector({ selected, onSelect }: ToneSelectorProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {TONES.map((opt) => {
        const isSelected = selected === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onSelect(opt.value)}
            className={cn(
              "group relative text-left p-4 rounded-xl border-2 transition-all duration-200",
              "hover:shadow-md",
              isSelected
                ? `${SELECTED_COLORS[opt.value]} shadow-md`
                : `border-gray-200 bg-white ${opt.color}`
            )}
          >
            {isSelected && (
              <div className="absolute top-2.5 right-2.5 w-4 h-4 bg-current rounded-full flex items-center justify-center opacity-80">
                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
            <span className="text-2xl mb-2.5 block">{opt.icon}</span>
            <p className={cn(
              "font-bold text-sm mb-1",
              isSelected ? LABEL_COLORS[opt.value] : "text-gray-900"
            )}>
              {opt.label}
            </p>
            <p className="text-[11px] text-gray-500 leading-tight">{opt.desc}</p>
          </button>
        );
      })}
    </div>
  );
}
