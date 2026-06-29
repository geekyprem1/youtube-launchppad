"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

const STEPS = [
  { id: 0, label: "Input" },
  { id: 1, label: "Topics" },
  { id: 2, label: "Language" },
  { id: 3, label: "Format" },
  { id: 4, label: "Audience" },
  { id: 5, label: "Tone" },
  { id: 6, label: "Hook" },
  { id: 7, label: "Script" },
  { id: 8, label: "Kit" },
];

interface WizardProgressProps {
  currentStep: number;
  onStepClick?: (step: number) => void;
}

export function WizardProgress({ currentStep, onStepClick }: WizardProgressProps) {
  return (
    <div className="w-full bg-white border-b border-gray-100 px-6 py-3">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-0">
          {STEPS.map((step, idx) => {
            const isCompleted = currentStep > step.id;
            const isActive = currentStep === step.id;
            const isClickable = isCompleted && onStepClick;

            return (
              <div key={step.id} className="flex items-center flex-1 min-w-0">
                {/* Step node */}
                <button
                  onClick={() => isClickable && onStepClick(step.id)}
                  disabled={!isClickable}
                  className={cn(
                    "flex flex-col items-center gap-1 flex-shrink-0 transition-all",
                    isClickable ? "cursor-pointer" : "cursor-default"
                  )}
                >
                  <div
                    className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300",
                      isCompleted
                        ? "bg-blue-600 border-blue-600 text-white"
                        : isActive
                          ? "bg-white border-blue-600 text-blue-600 shadow-md shadow-blue-100"
                          : "bg-gray-50 border-gray-200 text-gray-400"
                    )}
                  >
                    {isCompleted ? <Check className="w-3.5 h-3.5" /> : <span>{step.id + 1}</span>}
                  </div>
                  <span
                    className={cn(
                      "text-[10px] font-medium whitespace-nowrap hidden sm:block",
                      isActive ? "text-blue-700" : isCompleted ? "text-blue-500" : "text-gray-400"
                    )}
                  >
                    {step.label}
                  </span>
                </button>

                {/* Connector line */}
                {idx < STEPS.length - 1 && (
                  <div
                    className={cn(
                      "flex-1 h-0.5 mx-1 transition-all duration-500",
                      currentStep > step.id ? "bg-blue-500" : "bg-gray-200"
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Mobile: current step label */}
        <p className="sm:hidden text-center text-xs text-gray-500 mt-2">
          Step {currentStep + 1} of {STEPS.length} — {STEPS[currentStep]?.label}
        </p>
      </div>
    </div>
  );
}
