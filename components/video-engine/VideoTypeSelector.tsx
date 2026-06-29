"use client";

import { cn } from "@/lib/utils";
import { VideoType } from "@/domains/video-engine/types";

interface Option {
  value: VideoType;
  label: string;
  icon: string;
  desc: string;
  duration: string;
}

const OPTIONS: Option[] = [
  { value: "shorts",        label: "Shorts",              icon: "⚡", desc: "Ultra-fast, under 60 sec",         duration: "30–60 sec"  },
  { value: "long_form",     label: "Long Form",           icon: "🎬", desc: "In-depth full-length video",       duration: "8–15 min"   },
  { value: "tutorial",      label: "Tutorial",            icon: "📚", desc: "Step-by-step how-to guide",        duration: "5–10 min"   },
  { value: "listicle",      label: "Listicle",            icon: "📋", desc: "Top 10 / ranked list format",      duration: "5–12 min"   },
  { value: "documentary",   label: "Documentary",         icon: "🎥", desc: "Deep narrative storytelling",      duration: "10–20 min"  },
  { value: "storytelling",  label: "Storytelling",        icon: "📖", desc: "Personal journey / narrative",     duration: "5–15 min"   },
  { value: "faceless",      label: "Faceless",            icon: "🤖", desc: "Voiceover automation style",       duration: "5–10 min"   },
  { value: "news",          label: "News",                icon: "📰", desc: "Breaking news / current events",   duration: "3–8 min"    },
  { value: "podcast",       label: "Podcast",             icon: "🎙️", desc: "Conversational, long-form audio",  duration: "10–30 min"  },
];

interface VideoTypeSelectorProps {
  selected: VideoType | null;
  onSelect: (type: VideoType) => void;
}

export function VideoTypeSelector({ selected, onSelect }: VideoTypeSelectorProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {OPTIONS.map((opt) => {
        const isSelected = selected === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onSelect(opt.value)}
            className={cn(
              "group relative text-left p-4 rounded-xl border-2 transition-all duration-200",
              "hover:border-blue-400 hover:shadow-md hover:shadow-blue-50",
              isSelected
                ? "border-blue-600 bg-blue-50 shadow-md shadow-blue-100"
                : "border-gray-200 bg-white hover:bg-gray-50"
            )}
          >
            {isSelected && (
              <div className="absolute top-2.5 right-2.5 w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
            <span className="text-2xl mb-2 block">{opt.icon}</span>
            <p className={cn("font-bold text-sm mb-0.5", isSelected ? "text-blue-700" : "text-gray-900")}>
              {opt.label}
            </p>
            <p className="text-[11px] text-gray-500 mb-1.5">{opt.desc}</p>
            <span className={cn(
              "inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full",
              isSelected ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"
            )}>
              {opt.duration}
            </span>
          </button>
        );
      })}
    </div>
  );
}
