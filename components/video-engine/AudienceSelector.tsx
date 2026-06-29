"use client";

import { cn } from "@/lib/utils";
import { AudienceLevel, AudienceAge } from "@/domains/video-engine/types";

const LEVELS: { value: AudienceLevel; label: string; desc: string; icon: string }[] = [
  { value: "beginner",     label: "Beginner",     icon: "🌱", desc: "No prior knowledge needed" },
  { value: "intermediate", label: "Intermediate", icon: "📈", desc: "Some familiarity with the topic" },
  { value: "advanced",     label: "Advanced",     icon: "🚀", desc: "Deep expertise, peer-to-peer level" },
];

const AGES: { value: AudienceAge; label: string; icon: string }[] = [
  { value: "kids",   label: "Kids",   icon: "🧒" },
  { value: "teen",   label: "Teen",   icon: "🎮" },
  { value: "18_25",  label: "18–25",  icon: "🔥" },
  { value: "25_40",  label: "25–40",  icon: "💼" },
  { value: "40_plus",label: "40+",    icon: "🎯" },
];

interface AudienceSelectorProps {
  selectedLevel: AudienceLevel | null;
  selectedAge: AudienceAge | null;
  onSelectLevel: (level: AudienceLevel) => void;
  onSelectAge: (age: AudienceAge) => void;
}

function SelectionButton<T extends string>({
  value, label, icon, desc, selected, onClick,
}: { value: T; label: string; icon: string; desc?: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative text-left p-3.5 rounded-xl border-2 transition-all duration-200 w-full",
        "hover:border-blue-400 hover:shadow-sm",
        selected
          ? "border-blue-600 bg-blue-50 shadow-md shadow-blue-100"
          : "border-gray-200 bg-white"
      )}
    >
      {selected && (
        <div className="absolute top-2 right-2 w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
      <div className="flex items-center gap-2.5">
        <span className="text-xl">{icon}</span>
        <div>
          <p className={cn("font-bold text-sm", selected ? "text-blue-700" : "text-gray-900")}>{label}</p>
          {desc && <p className="text-[11px] text-gray-500">{desc}</p>}
        </div>
      </div>
    </button>
  );
}

export function AudienceSelector({
  selectedLevel, selectedAge, onSelectLevel, onSelectAge,
}: AudienceSelectorProps) {
  return (
    <div className="space-y-6">
      {/* Knowledge Level */}
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-xs flex items-center justify-center font-bold">1</span>
          Knowledge Level
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {LEVELS.map((opt) => (
            <SelectionButton
              key={opt.value}
              value={opt.value}
              label={opt.label}
              icon={opt.icon}
              desc={opt.desc}
              selected={selectedLevel === opt.value}
              onClick={() => onSelectLevel(opt.value)}
            />
          ))}
        </div>
      </div>

      {/* Age Group */}
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-xs flex items-center justify-center font-bold">2</span>
          Age Group
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {AGES.map((opt) => (
            <SelectionButton
              key={opt.value}
              value={opt.value}
              label={opt.label}
              icon={opt.icon}
              selected={selectedAge === opt.value}
              onClick={() => onSelectAge(opt.value)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
