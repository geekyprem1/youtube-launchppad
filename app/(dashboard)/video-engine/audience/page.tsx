"use client";

import { useRouter } from "next/navigation";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { useVideoEngineStore } from "@/lib/video-engine/state";
import { WizardProgress } from "@/components/video-engine/WizardProgress";
import { AudienceSelector } from "@/components/video-engine/AudienceSelector";
import { AudienceLevel, AudienceAge } from "@/domains/video-engine/types";

export default function AudiencePage() {
  const router = useRouter();
  const { audienceLevel, audienceAge, setAudience, setStep } = useVideoEngineStore();

  const isComplete = audienceLevel && audienceAge;

  function handleNext() {
    if (!isComplete) return;
    setStep(4);
    router.push("/video-engine/tone");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <WizardProgress currentStep={4} />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">Step 4 of 8</p>
          <h1 className="text-2xl font-black text-gray-900">Who Is Your Audience?</h1>
          <p className="text-gray-500 mt-1">AI will adjust vocabulary complexity and references based on your audience profile.</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <AudienceSelector
            selectedLevel={audienceLevel}
            selectedAge={audienceAge}
            onSelectLevel={(level: AudienceLevel) => setAudience(level, audienceAge!)}
            onSelectAge={(age: AudienceAge) => setAudience(audienceLevel!, age)}
          />
        </div>

        <div className="flex justify-between items-center mt-6">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm font-medium">
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          <button
            onClick={handleNext}
            disabled={!isComplete}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors"
          >
            Continue <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
