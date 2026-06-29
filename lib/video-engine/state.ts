"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  VideoType, AudienceLevel, AudienceAge, Tone, Language,
  Topic, Hook, Script, VideoKit, ContentContext, InputType,
} from "@/domains/video-engine/types";

interface VideoEngineState {
  sessionId: string | null;

  // Step 0
  inputType: InputType | null;
  rawInput: string;
  channelId: string | null;
  resolvedNiche: string | null;

  // Step 1
  allTopics: Topic[];
  selectedTopic: Topic | null;

  // Step 2
  language: Language;

  // Step 3
  videoType: VideoType | null;

  // Step 4
  audienceLevel: AudienceLevel | null;
  audienceAge: AudienceAge | null;

  // Step 5
  tone: Tone | null;

  // Step 6
  allHooks: Hook[];
  selectedHook: Hook | null;

  // Step 7
  script: Script | null;

  // Step 8
  videoKit: Partial<VideoKit>;

  // UI
  currentStep: number;
  kitLoadingMap: Record<string, boolean>;
  kitErrorMap: Record<string, boolean>;

  // ─── Actions ────────────────────────────────────────────────────
  setSessionId: (id: string) => void;
  setInput: (type: InputType, raw: string, channelId?: string, niche?: string) => void;
  setTopics: (topics: Topic[]) => void;
  setSelectedTopic: (topic: Topic) => void;
  setLanguage: (lang: Language) => void;
  setVideoType: (type: VideoType) => void;
  setAudience: (level: AudienceLevel, age: AudienceAge) => void;
  setTone: (tone: Tone) => void;
  setHooks: (hooks: Hook[]) => void;
  setSelectedHook: (hook: Hook) => void;
  setScript: (script: Script) => void;
  setKitSection: (key: keyof VideoKit, data: unknown) => void;
  setKitLoading: (key: string, loading: boolean) => void;
  setKitError: (key: string, error: boolean) => void;
  setStep: (step: number) => void;
  resetSession: () => void;

  // ─── Derived ─────────────────────────────────────────────────────
  /** Assembles the ContentContext for API calls (Steps 6-8). */
  getContentContext: () => ContentContext | null;
}

const initialState = {
  sessionId: null,
  inputType: null,
  rawInput: "",
  channelId: null,
  resolvedNiche: null,
  allTopics: [],
  selectedTopic: null,
  language: "English" as Language,
  videoType: null,
  audienceLevel: null,
  audienceAge: null,
  tone: null,
  allHooks: [],
  selectedHook: null,
  script: null,
  videoKit: {},
  currentStep: 0,
  kitLoadingMap: {},
  kitErrorMap: {},
};

export const useVideoEngineStore = create<VideoEngineState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setSessionId: (id) => set({ sessionId: id }),

      setInput: (type, raw, channelId, niche) =>
        set({ inputType: type, rawInput: raw, channelId: channelId ?? null, resolvedNiche: niche ?? null }),

      setTopics: (topics) => set({ allTopics: topics }),

      setSelectedTopic: (topic) => set({ selectedTopic: topic }),

      setLanguage: (lang) => set({ language: lang }),

      setVideoType: (type) => set({ videoType: type }),

      setAudience: (level, age) => set({ audienceLevel: level, audienceAge: age }),

      setTone: (tone) => set({ tone }),

      setHooks: (hooks) => set({ allHooks: hooks }),

      setSelectedHook: (hook) => set({ selectedHook: hook }),

      setScript: (script) => set({ script }),

      setKitSection: (key, data) =>
        set((s) => ({ videoKit: { ...s.videoKit, [key]: data } })),

      setKitLoading: (key, loading) =>
        set((s) => ({ kitLoadingMap: { ...s.kitLoadingMap, [key]: loading } })),

      setKitError: (key, error) =>
        set((s) => ({ kitErrorMap: { ...s.kitErrorMap, [key]: error } })),

      setStep: (step) => set({ currentStep: step }),

      resetSession: () => set({ ...initialState }),

      getContentContext: (): ContentContext | null => {
        const s = get();
        if (
          !s.selectedTopic ||
          !s.videoType ||
          !s.audienceLevel ||
          !s.audienceAge ||
          !s.tone
        ) return null;

        // Auto-generate a session ID if not yet created
        let sessionId = s.sessionId;
        if (!sessionId) {
          sessionId = crypto.randomUUID();
          set({ sessionId });
        }

        return {
          topic: s.selectedTopic.topic,
          language: s.language,
          video_type: s.videoType,
          audience_level: s.audienceLevel,
          audience_age: s.audienceAge,
          tone: s.tone,
          hook: s.selectedHook?.text,
          script_summary: s.script
            ? s.script.intro.content.slice(0, 200)
            : undefined,
          session_id: sessionId,
        };
      },
    }),
    {
      name: "ve-wizard-state",
      storage: {
        getItem: (key) => {
          if (typeof window === "undefined") return null;
          const item = sessionStorage.getItem(key);
          return item ? JSON.parse(item) : null;
        },
        setItem: (key, value) => {
          if (typeof window !== "undefined")
            sessionStorage.setItem(key, JSON.stringify(value));
        },
        removeItem: (key) => {
          if (typeof window !== "undefined") sessionStorage.removeItem(key);
        },
      },
    }
  )
);
