"use client";

import { useRouter } from "next/navigation";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { useVideoEngineStore } from "@/lib/video-engine/state";
import { WizardProgress } from "@/components/video-engine/WizardProgress";
import { Language } from "@/domains/video-engine/types";
import { cn } from "@/lib/utils";

const LANGUAGES: { value: Language; flag: string; native: string }[] = [
  { value: "English",  flag: "🇬🇧", native: "English"    },
  { value: "Hindi",    flag: "🇮🇳", native: "हिंदी"        },
  { value: "Hinglish", flag: "🇮🇳", native: "Hinglish"    },
  { value: "Spanish",  flag: "🇪🇸", native: "Español"     },
  { value: "French",   flag: "🇫🇷", native: "Français"    },
  { value: "German",   flag: "🇩🇪", native: "Deutsch"     },
  { value: "Japanese", flag: "🇯🇵", native: "日本語"        },
  { value: "Tamil",    flag: "🇮🇳", native: "தமிழ்"         },
  { value: "Telugu",   flag: "🇮🇳", native: "తెలుగు"        },
  { value: "Bengali",  flag: "🇮🇳", native: "বাংলা"         },
];

export default function LanguagePage() {
  const router = useRouter();
  const { language, setLanguage, setStep } = useVideoEngineStore();

  function handleSelect(lang: Language) {
    setLanguage(lang);
  }

  function handleNext() {
    setStep(2);
    router.push("/video-engine/video-type");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <WizardProgress currentStep={2} />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">Step 2 of 8</p>
          <h1 className="text-2xl font-black text-gray-900">Select Output Language</h1>
          <p className="text-gray-500 mt-1">All AI-generated content — script, titles, hooks, descriptions — will be in this language.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
          {LANGUAGES.map((lang) => {
            const isSelected = language === lang.value;
            return (
              <button
                key={lang.value}
                onClick={() => handleSelect(lang.value)}
                className={cn(
                  "flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all duration-200 hover:shadow-sm",
                  isSelected
                    ? "border-blue-600 bg-blue-50 shadow-md shadow-blue-100"
                    : "border-gray-200 bg-white hover:border-blue-300"
                )}
              >
                <span className="text-2xl">{lang.flag}</span>
                <div>
                  <p className={cn("font-bold text-sm", isSelected ? "text-blue-700" : "text-gray-900")}>
                    {lang.value}
                  </p>
                  <p className="text-[11px] text-gray-500">{lang.native}</p>
                </div>
                {isSelected && (
                  <div className="ml-auto w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex justify-between items-center">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm font-medium">
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors"
          >
            Continue <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
