"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Image, Type, FileText, Hash, Search, Tag, Wand2, Pin,
  Users, Scissors, Share2, ChevronLeft, RefreshCw, Copy, Check, Download
} from "lucide-react";
import { useVideoEngineStore } from "@/lib/video-engine/state";
import { WizardProgress } from "@/components/video-engine/WizardProgress";
import { cn } from "@/lib/utils";

const KIT_SECTIONS = [
  { key: "thumbnail_brief",   label: "Thumbnail Brief",      icon: Image,     color: "text-purple-600" },
  { key: "titles",            label: "Title Generator",      icon: Type,      color: "text-blue-600" },
  { key: "description",       label: "Description",          icon: FileText,  color: "text-green-600" },
  { key: "hashtags",          label: "Hashtags",             icon: Hash,      color: "text-pink-600" },
  { key: "keywords",          label: "Keywords",             icon: Search,    color: "text-orange-600" },
  { key: "tags",              label: "YouTube Tags",         icon: Tag,       color: "text-teal-600" },
  { key: "thumbnail_prompt",  label: "AI Image Prompt",      icon: Wand2,     color: "text-violet-600" },
  { key: "pinned_comment",    label: "Pinned Comment",       icon: Pin,       color: "text-red-600" },
  { key: "community_post",    label: "Community Post",       icon: Users,     color: "text-indigo-600" },
  { key: "shorts_caption",    label: "Shorts Caption",       icon: Scissors,  color: "text-yellow-600" },
  { key: "social_kit",        label: "Social Promo Kit",     icon: Share2,    color: "text-cyan-600" },
] as const;

function CopyBtn({ text }: { text: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setOk(true); setTimeout(() => setOk(false), 1500); }}
      className="flex items-center gap-1 text-xs text-gray-400 hover:text-blue-600 transition-colors">
      {ok ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
      {ok ? "Copied" : "Copy"}
    </button>
  );
}

function SectionContent({ sectionKey, data }: { sectionKey: string; data: any }) {
  if (data === null) return <p className="text-sm text-red-500">Generation failed — click Retry</p>;
  if (!data) return <p className="text-sm text-gray-400 italic">Loading…</p>;

  switch (sectionKey) {
    case "titles":
      return (
        <div className="space-y-2">
          {(data as any[]).map((t: any, i: number) => (
            <div key={i} className="flex items-start justify-between gap-3 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-900 flex-1">{t.title}</p>
              <div className="flex gap-2 text-xs flex-shrink-0">
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded font-semibold">CTR {t.ctr_score}</span>
                <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded font-semibold">SEO {t.seo_score}</span>
              </div>
            </div>
          ))}
        </div>
      );
    case "hashtags":
      return (
        <div className="space-y-2">
          {["primary", "secondary", "trending"].map((cat) => (
            <div key={cat}>
              <p className="text-xs font-bold text-gray-400 uppercase mb-1">{cat}</p>
              <div className="flex flex-wrap gap-1.5">
                {(data[cat] as string[]).map((h: string) => (
                  <span key={h} className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">{h}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      );
    case "keywords":
      return (
        <div className="space-y-2">
          {["primary", "secondary", "long_tail"].map((cat) => (
            <div key={cat}>
              <p className="text-xs font-bold text-gray-400 uppercase mb-1">{cat.replace("_", " ")}</p>
              <div className="flex flex-wrap gap-1.5">
                {(data[cat] as string[]).map((k: string) => (
                  <span key={k} className="text-xs bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded">{k}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      );
    case "tags":
      return (
        <div className="flex flex-wrap gap-1.5">
          {(data as string[]).map((t: string) => (
            <span key={t} className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">{t}</span>
          ))}
        </div>
      );
    case "thumbnail_brief":
      return (
        <div className="space-y-2 text-sm text-gray-700">
          <div><span className="font-semibold text-gray-500">Headline:</span> {data.headline}</div>
          <div><span className="font-semibold text-gray-500">Emotion:</span> {data.emotion}</div>
          <div><span className="font-semibold text-gray-500">Composition:</span> {data.composition}</div>
          <div>
            <span className="font-semibold text-gray-500">Colors:</span>
            <div className="flex gap-2 mt-1">
              {data.color_suggestions?.map((c: string) => (
                <div key={c} className="flex items-center gap-1">
                  <div className="w-5 h-5 rounded border border-gray-200" style={{ backgroundColor: c }} />
                  <span className="text-xs text-gray-500">{c}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 mt-2">
            <p className="text-xs font-semibold text-gray-500 mb-1">Visual Prompt</p>
            <p className="text-sm">{data.prompt}</p>
          </div>
        </div>
      );
    case "social_kit":
      return (
        <div className="space-y-3">
          {["twitter", "facebook", "instagram", "linkedin"].map((platform) => (
            <div key={platform} className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-xs font-bold text-gray-500 capitalize">{platform === "twitter" ? "X / Twitter" : platform}</p>
                <CopyBtn text={data[platform]} />
              </div>
              <p className="text-sm text-gray-700">{data[platform]}</p>
            </div>
          ))}
        </div>
      );
    case "description":
      return (
        <div className="space-y-3 text-sm text-gray-700">
          <p className="whitespace-pre-line">{data.description}</p>
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-xs font-semibold text-blue-600 mb-1">CTA</p>
            <p>{data.cta}</p>
          </div>
          {data.links_placeholder && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs font-semibold text-gray-500 mb-1">Links Placeholder</p>
              <p className="whitespace-pre-line text-gray-600">{data.links_placeholder}</p>
            </div>
          )}
          {data.chapters?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1">Chapters</p>
              {data.chapters.map((c: string) => <p key={c} className="text-xs text-gray-600">{c}</p>)}
            </div>
          )}
        </div>
      );
    default:
      // String fields: pinned_comment, community_post, shorts_caption, thumbnail_prompt
      if (typeof data === "string") {
        return <p className="text-sm text-gray-700 whitespace-pre-line">{data}</p>;
      }
      if (data?.image_prompt) {
        return (
          <div className="space-y-2">
            <p className="text-sm text-gray-700">{data.image_prompt}</p>
            <p className="text-xs text-gray-500 italic">{data.style_notes}</p>
          </div>
        );
      }
      return <pre className="text-xs text-gray-500 overflow-auto">{JSON.stringify(data, null, 2)}</pre>;
  }
}

export default function KitPage() {
  const router = useRouter();
  const { videoKit, setKitSection, setKitLoading, kitLoadingMap, kitErrorMap, setKitError, getContentContext } = useVideoEngineStore();
  const [activeTab, setActiveTab] = useState<string>("thumbnail_brief");
  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    const checkState = () => {
      const ctx = getContentContext();
      if (!ctx) {
        router.replace("/video-engine");
        return;
      }
      if (!fetched) { fetchKit(); setFetched(true); }
    };

    if (useVideoEngineStore.persist.hasHydrated()) {
      checkState();
    } else {
      const unsub = useVideoEngineStore.persist.onFinishHydration(() => checkState());
      return () => unsub();
    }
  }, [fetched]);

  async function fetchKit() {
    const ctx = getContentContext();
    if (!ctx) return;

    // Set all sections loading
    KIT_SECTIONS.forEach(({ key }) => setKitLoading(key, true));

    const res = await fetch("/api/video-engine/kit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ctx),
    });
    const data = await res.json();

    if (data.data?.kit) {
      KIT_SECTIONS.forEach(({ key }) => {
        setKitSection(key as any, data.data.kit[key]);
        setKitLoading(key, false);
        setKitError(key, data.data.kit[key] === null);
      });
    }
  }

  const activeData = (videoKit as any)?.[activeTab];
  const section = KIT_SECTIONS.find(s => s.key === activeTab)!;

  return (
    <div className="min-h-screen bg-gray-50">
      <WizardProgress currentStep={8} />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">Step 8 of 8</p>
            <h1 className="text-2xl font-black text-gray-900">Your Complete Video Kit</h1>
            <p className="text-gray-500 mt-1">Everything you need to publish. Click any section to view and copy.</p>
          </div>
          <button
            onClick={() => router.push("/video-engine/export")}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            <Download className="w-4 h-4" /> Export
          </button>
        </div>

        <div className="grid grid-cols-12 gap-4">
          {/* Section list */}
          <div className="col-span-4 space-y-1">
            {KIT_SECTIONS.map(({ key, label, icon: Icon, color }) => {
              const isLoading = kitLoadingMap[key];
              const hasError = kitErrorMap[key];
              const isActive = activeTab === key;
              return (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-150",
                    isActive ? "bg-blue-50 border border-blue-200" : "hover:bg-white border border-transparent"
                  )}
                >
                  <Icon className={cn("w-4 h-4 flex-shrink-0", isActive ? color : "text-gray-400")} />
                  <span className={cn("text-sm font-medium flex-1", isActive ? "text-gray-900" : "text-gray-600")}>
                    {label}
                  </span>
                  {isLoading && <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />}
                  {hasError && <span className="text-red-500 text-xs">!</span>}
                  {!isLoading && !hasError && (videoKit as any)?.[key] && (
                    <Check className="w-3.5 h-3.5 text-green-500" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Content panel */}
          <div className="col-span-8 bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
              <div className="flex items-center gap-2">
                {section && <section.icon className={cn("w-4 h-4", section.color)} />}
                <h2 className="font-bold text-sm text-gray-900">{section?.label}</h2>
              </div>
              <div className="flex items-center gap-2">
                {kitErrorMap[activeTab] && (
                  <button onClick={fetchKit} className="flex items-center gap-1 text-xs text-red-600 hover:text-red-800 font-medium border border-red-200 rounded-lg px-2 py-1">
                    <RefreshCw className="w-3 h-3" /> Retry
                  </button>
                )}
                {activeData && typeof activeData === "string" && <CopyBtn text={activeData} />}
              </div>
            </div>
            <div className="p-5 overflow-auto max-h-[600px]">
              {kitLoadingMap[activeTab] ? (
                <div className="space-y-2 animate-pulse">
                  <div className="h-4 bg-gray-100 rounded w-3/4" />
                  <div className="h-4 bg-gray-100 rounded w-full" />
                  <div className="h-4 bg-gray-100 rounded w-1/2" />
                </div>
              ) : (
                <SectionContent sectionKey={activeTab} data={activeData ?? null} />
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-between">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm font-medium">
            <ChevronLeft className="w-4 h-4" /> Back to Script
          </button>
        </div>
      </div>
    </div>
  );
}
