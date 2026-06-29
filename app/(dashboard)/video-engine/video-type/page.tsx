"use client";

import { useRouter } from "next/navigation";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { useVideoEngineStore } from "@/lib/video-engine/state";
import { WizardProgress } from "@/components/video-engine/WizardProgress";
import { VideoTypeSelector } from "@/components/video-engine/VideoTypeSelector";
import { VideoType } from "@/domains/video-engine/types";

export default function VideoTypePage() {
  const router = useRouter();
  const { videoType, setVideoType, setStep } = useVideoEngineStore();

  function handleSelect(type: VideoType) { setVideoType(type); }

  function handleNext() {
    if (!videoType) return;
    setStep(3);
    router.push("/video-engine/audience");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <WizardProgress currentStep={3} />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">Step 3 of 8</p>
          <h1 className="text-2xl font-black text-gray-900">What Type of Video?</h1>
          <p className="text-gray-500 mt-1">This defines your script structure, hook style, and content length. The AI will adapt everything to this format.</p>
        </div>

        <VideoTypeSelector selected={videoType} onSelect={handleSelect} />

        <div className="flex justify-between items-center mt-8">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm font-medium">
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          <button
            onClick={handleNext}
            disabled={!videoType}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors"
          >
            Continue <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
