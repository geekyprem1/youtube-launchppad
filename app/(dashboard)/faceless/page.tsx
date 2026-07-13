"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import {
  FACELESS_TEMPLATES,
  type FacelessTemplate,
} from "@/domains/faceless/templates";
import {
  buildSlideshowPlan,
  type SlideshowPlan,
} from "@/domains/faceless/slideshow";
import {
  Ghost,
  CheckCircle,
  Copy,
  Check,
  ArrowRight,
  ArrowLeft,
  Mic,
  Image as ImageIcon,
  Film,
  Clapperboard,
  Sparkles,
  ListChecks,
  XCircle,
  Layers,
} from "lucide-react";

type Step = 1 | 2 | 3 | 4;

type PackageResult = {
  title_options: string[];
  hook: string;
  full_script: string;
  word_count: number;
  estimated_minutes: number;
  scenes: {
    name: string;
    spoken: string;
    on_screen_text: string;
    visual_prompt: string;
    duration_seconds: number;
  }[];
  thumbnail_prompt: string;
  thumbnail_text_overlay: string;
  voice_direction: string;
  video_gen_prompt: string;
  tags: string[];
  description: string;
  checklist: string[];
};

const STEPS: { n: Step; label: string }[] = [
  { n: 1, label: "Template" },
  { n: 2, label: "Topic" },
  { n: 3, label: "Generate" },
  { n: 4, label: "Produce" },
];

export default function FacelessPage() {
  const [step, setStep] = useState<Step>(1);
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [topic, setTopic] = useState("");
  const [videoType, setVideoType] = useState<"long" | "short">("long");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pkg, setPkg] = useState<PackageResult | null>(null);
  const [slideshow, setSlideshow] = useState<SlideshowPlan | null>(null);
  const [copied, setCopied] = useState("");

  const template: FacelessTemplate | undefined = useMemo(
    () => FACELESS_TEMPLATES.find((t) => t.id === templateId),
    [templateId]
  );

  async function copyText(text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(text.slice(0, 40));
    setTimeout(() => setCopied(""), 1500);
  }

  function pickSample(t: string) {
    setTopic(t);
  }

  async function generatePackage() {
    if (!templateId || !topic.trim()) return;
    setLoading(true);
    setError("");
    setPkg(null);
    try {
      const res = await fetch("/api/faceless/package", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          template_id: templateId,
          topic: topic.trim(),
          video_type: videoType,
          extra_notes: notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      const pack = data.package as PackageResult;
      setPkg(pack);
      setSlideshow(
        buildSlideshowPlan({
          topic: topic.trim(),
          video_type: videoType,
          full_script: pack.full_script || "",
          visual_style: template?.visual_style,
        })
      );
      setStep(4);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  /** Prefill sibling tools via sessionStorage */
  function handoff(tool: "voice" | "clickbait" | "vcp" | "kit") {
    if (!pkg) return;
    try {
      if (tool === "voice") {
        sessionStorage.setItem("faceless_voice_script", pkg.full_script);
      }
      if (tool === "clickbait") {
        sessionStorage.setItem(
          "faceless_thumb_topic",
          pkg.title_options?.[0] || topic
        );
        sessionStorage.setItem(
          "faceless_thumb_prompt",
          pkg.thumbnail_prompt || ""
        );
      }
      if (tool === "vcp") {
        sessionStorage.setItem(
          "faceless_video_prompt",
          pkg.video_gen_prompt || pkg.hook
        );
      }
      if (tool === "kit") {
        sessionStorage.setItem(
          "faceless_kit_topic",
          pkg.title_options?.[0] || topic
        );
      }
    } catch {
      // ignore
    }
  }

  return (
    <>
      <Header
        title="Faceless Empire"
        subtitle="Guided pipeline: template → script package → voice · thumb · video"
      />

      <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
        {/* Stepper */}
        <div className="flex flex-wrap gap-2">
          {STEPS.map((s) => (
            <button
              key={s.n}
              type="button"
              onClick={() => {
                if (s.n < step || (s.n === 4 && pkg) || s.n <= step) setStep(s.n);
              }}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors",
                step === s.n
                  ? "bg-slate-900 text-white border-slate-900"
                  : step > s.n
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : "bg-white text-gray-500 border-gray-200"
              )}
            >
              {step > s.n ? (
                <CheckCircle className="w-3.5 h-3.5" />
              ) : (
                <span className="w-4 h-4 rounded-full bg-current/10 flex items-center justify-center text-[10px]">
                  {s.n}
                </span>
              )}
              {s.label}
            </button>
          ))}
        </div>

        {/* Step 1 — Templates */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-xl bg-slate-900 flex items-center justify-center">
                <Ghost className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900">
                  Choose a faceless template
                </h2>
                <p className="text-sm text-gray-500">
                  Pre-built production styles — no face cam required.
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {FACELESS_TEMPLATES.map((t) => {
                const selected = templateId === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTemplateId(t.id)}
                    className={cn(
                      "text-left p-4 rounded-xl border transition-all",
                      selected
                        ? "border-slate-900 ring-2 ring-slate-900/20 bg-slate-50"
                        : "border-gray-200 bg-white hover:border-slate-300"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="font-semibold text-gray-900 text-sm">
                        {t.name}
                      </p>
                      <Badge variant="default" className="text-[10px]">
                        {t.format}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-600 mb-2">{t.niche}</p>
                    <p className="text-xs text-gray-500 line-clamp-2">
                      {t.description}
                    </p>
                  </button>
                );
              })}
            </div>

            <Button
              disabled={!templateId}
              onClick={() => setStep(2)}
              className="bg-slate-900 hover:bg-slate-800 text-white"
            >
              Continue <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}

        {/* Step 2 — Topic */}
        {step === 2 && template && (
          <div className="grid lg:grid-cols-12 gap-6">
            <Card className="lg:col-span-5">
              <CardBody className="p-5 space-y-4">
                <p className="text-xs font-bold uppercase text-gray-400">
                  Template
                </p>
                <h2 className="font-bold text-gray-900">{template.name}</h2>
                <p className="text-sm text-gray-600">{template.description}</p>
                <div className="text-xs space-y-1 text-gray-500">
                  <p>
                    <strong>Visual:</strong> {template.visual_style}
                  </p>
                  <p>
                    <strong>Voice:</strong> {template.voice_style}
                  </p>
                  <p>
                    <strong>Thumb:</strong> {template.thumbnail_formula}
                  </p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setStep(1)}
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Change template
                </Button>
              </CardBody>
            </Card>

            <Card className="lg:col-span-7">
              <CardBody className="p-5 space-y-4">
                <h3 className="font-semibold text-gray-900">
                  Topic for this video
                </h3>
                <Input
                  label="Topic *"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="What is this video about?"
                />
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-2">
                    Sample topics (click to use)
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {template.sample_topics.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => pickSample(s)}
                        className="text-left text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 hover:border-slate-400 hover:bg-slate-50"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Format
                  </label>
                  <div className="flex gap-2">
                    {(["long", "short"] as const).map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setVideoType(f)}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-sm font-medium border",
                          videoType === f
                            ? "bg-slate-900 text-white border-slate-900"
                            : "bg-white text-gray-600 border-gray-200"
                        )}
                      >
                        {f === "long" ? "Long-form" : "Shorts"}
                      </button>
                    ))}
                  </div>
                </div>
                <Textarea
                  label="Extra notes (optional)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Audience, must-include points, language…"
                />
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => setStep(1)}>
                    Back
                  </Button>
                  <Button
                    disabled={!topic.trim()}
                    onClick={() => setStep(3)}
                    className="bg-slate-900 hover:bg-slate-800 text-white"
                  >
                    Continue <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </CardBody>
            </Card>
          </div>
        )}

        {/* Step 3 — Generate */}
        {step === 3 && template && (
          <Card>
            <CardBody className="p-6 md:p-8 space-y-4 max-w-xl">
              <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                Generate production package
              </h2>
              <p className="text-sm text-gray-600">
                AI will create script, scenes, thumbnail prompt, voice
                direction, and video gen prompt for{" "}
                <strong>{template.name}</strong> on topic{" "}
                <strong>{topic}</strong> ({videoType}).
              </p>
              {error && (
                <p className="text-sm text-red-600 flex items-center gap-1.5">
                  <XCircle className="w-4 h-4" /> {error}
                </p>
              )}
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button
                  loading={loading}
                  onClick={generatePackage}
                  className="bg-slate-900 hover:bg-slate-800 text-white"
                >
                  <Clapperboard className="w-4 h-4 mr-2" />
                  Build package
                </Button>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Step 4 — Results + handoffs */}
        {step === 4 && pkg && template && (
          <div className="space-y-6">
            <Card className="overflow-hidden border-slate-200">
              <div className="bg-slate-900 p-5 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <p className="text-xs text-slate-300 uppercase tracking-wide">
                    {template.name} · {videoType}
                  </p>
                  <h2 className="text-xl font-bold mt-1">
                    Package ready · ~{pkg.estimated_minutes || "?"} min ·{" "}
                    {pkg.word_count || "—"} words
                  </h2>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setStep(2);
                    setPkg(null);
                  }}
                  className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                >
                  New topic
                </Button>
              </div>
              <CardBody className="p-5 space-y-3">
                <p className="text-sm text-gray-600">
                  <strong>Hook:</strong> {pkg.hook}
                </p>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase mb-2">
                    Title options
                  </p>
                  <div className="space-y-1.5">
                    {(pkg.title_options || []).map((t) => (
                      <div
                        key={t}
                        className="flex items-start justify-between gap-2 p-2 bg-gray-50 rounded-lg"
                      >
                        <p className="text-sm text-gray-900 flex-1">{t}</p>
                        <button
                          type="button"
                          onClick={() => copyText(t)}
                          className="text-gray-400 hover:text-slate-800"
                        >
                          {copied && t.startsWith(copied) ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </CardBody>
            </Card>

            <div className="grid lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <h3 className="text-sm font-semibold">Full script (TTS)</h3>
                  <button
                    type="button"
                    onClick={() => copyText(pkg.full_script)}
                    className="text-gray-400 hover:text-slate-800"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </CardHeader>
                <CardBody>
                  <pre className="text-xs whitespace-pre-wrap font-sans text-gray-700 max-h-80 overflow-y-auto bg-gray-50 p-3 rounded-lg">
                    {pkg.full_script}
                  </pre>
                  <p className="text-xs text-gray-500 mt-2">
                    Voice direction: {pkg.voice_direction}
                  </p>
                </CardBody>
              </Card>

              <Card>
                <CardHeader>
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <ListChecks className="w-4 h-4" /> Scenes
                  </h3>
                </CardHeader>
                <CardBody className="space-y-2 max-h-96 overflow-y-auto">
                  {(pkg.scenes || []).map((s, i) => (
                    <div
                      key={i}
                      className="p-3 border border-gray-100 rounded-lg bg-white"
                    >
                      <div className="flex justify-between gap-2 mb-1">
                        <p className="text-sm font-semibold text-gray-900">
                          {s.name}
                        </p>
                        <span className="text-[10px] text-gray-400">
                          ~{s.duration_seconds}s
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mb-1">{s.spoken}</p>
                      <p className="text-[11px] text-slate-500">
                        On-screen: {s.on_screen_text}
                      </p>
                      <p className="text-[11px] text-indigo-700 mt-0.5">
                        Visual: {s.visual_prompt}
                      </p>
                    </div>
                  ))}
                </CardBody>
              </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <h3 className="text-sm font-semibold">Thumbnail</h3>
                </CardHeader>
                <CardBody className="space-y-2 text-sm">
                  <p>
                    <span className="text-gray-500">Overlay:</span>{" "}
                    <strong>{pkg.thumbnail_text_overlay}</strong>
                  </p>
                  <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded-lg">
                    {pkg.thumbnail_prompt}
                  </p>
                  <button
                    type="button"
                    onClick={() => copyText(pkg.thumbnail_prompt)}
                    className="text-xs text-indigo-600 font-medium"
                  >
                    Copy prompt
                  </button>
                </CardBody>
              </Card>
              <Card>
                <CardHeader>
                  <h3 className="text-sm font-semibold">Description & tags</h3>
                </CardHeader>
                <CardBody className="space-y-2">
                  <pre className="text-xs whitespace-pre-wrap font-sans bg-gray-50 p-2 rounded-lg text-gray-700">
                    {pkg.description}
                  </pre>
                  <div className="flex flex-wrap gap-1">
                    {(pkg.tags || []).map((tag) => (
                      <Badge key={tag} variant="blue">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardBody>
              </Card>
            </div>

            {/* Produce handoffs */}
            <Card className="border-emerald-100 bg-emerald-50/20">
              <CardHeader>
                <h3 className="text-sm font-semibold text-gray-900">
                  Step 4 — Produce with your tools
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  OTO9 unlocks these modules. Open each tool with your package
                  data ready to paste.
                </p>
              </CardHeader>
              <CardBody className="grid sm:grid-cols-2 gap-3">
                <HandoffCard
                  href="/voice-studio"
                  icon={Mic}
                  title="Voice Studio"
                  desc="Paste full script → generate voiceover"
                  onClick={() => handoff("voice")}
                />
                <HandoffCard
                  href="/clickbait-thumbnail"
                  icon={ImageIcon}
                  title="ClickBoost Thumbnail"
                  desc="Use title + thumbnail prompt"
                  onClick={() => handoff("clickbait")}
                />
                <HandoffCard
                  href="/video-creation-pro"
                  icon={Film}
                  title="Video Creation Pro"
                  desc="AI clip from video_gen_prompt"
                  onClick={() => {
                    handoff("vcp");
                    copyText(pkg.video_gen_prompt);
                  }}
                />
                <HandoffCard
                  href="/video-engine/kit"
                  icon={Clapperboard}
                  title="Video Kit"
                  desc="Titles, tags, social kit extras"
                  onClick={() => handoff("kit")}
                />
              </CardBody>
            </Card>

            {pkg.checklist?.length > 0 && (
              <Card>
                <CardHeader>
                  <h3 className="text-sm font-semibold">Export checklist</h3>
                </CardHeader>
                <CardBody>
                  <ul className="space-y-1.5">
                    {pkg.checklist.map((c, i) => (
                      <li
                        key={i}
                        className="text-sm text-gray-700 flex gap-2"
                      >
                        <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        {c}
                      </li>
                    ))}
                  </ul>
                </CardBody>
              </Card>
            )}

            {slideshow && (
              <Card className="border-slate-200">
                <CardHeader>
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <Layers className="w-4 h-4" />
                    Slideshow engine plan (stock + captions)
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Edit list for CapCut/Premiere — {slideshow.clips.length}{" "}
                    clips · ~{slideshow.total_seconds}s · {slideshow.aspect} ·{" "}
                    {slideshow.music_mood}
                  </p>
                </CardHeader>
                <CardBody className="space-y-3">
                  <p className="text-xs text-gray-600">
                    Captions: {slideshow.captions_style}
                  </p>
                  <div className="max-h-72 overflow-y-auto space-y-2">
                    {slideshow.clips.map((c) => (
                      <div
                        key={c.index}
                        className="p-2.5 rounded-lg border border-gray-100 bg-gray-50 text-xs"
                      >
                        <div className="flex justify-between font-semibold text-gray-800">
                          <span>
                            #{c.index} · {c.start_sec}s (+{c.duration_sec}s)
                          </span>
                          <span className="text-gray-400">{c.motion}</span>
                        </div>
                        <p className="text-gray-700 mt-1">{c.caption}</p>
                        <p className="text-indigo-700 mt-0.5">
                          Stock search: {c.stock_search}
                        </p>
                      </div>
                    ))}
                  </div>
                  <ul className="space-y-1">
                    {slideshow.export_checklist.map((e, i) => (
                      <li key={i} className="text-xs text-gray-600 flex gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        {e}
                      </li>
                    ))}
                  </ul>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() =>
                      copyText(JSON.stringify(slideshow, null, 2))
                    }
                  >
                    <Copy className="w-3.5 h-3.5 mr-1" />
                    Copy slideshow JSON
                  </Button>
                </CardBody>
              </Card>
            )}
          </div>
        )}
      </div>
    </>
  );
}

function HandoffCard({
  href,
  icon: Icon,
  title,
  desc,
  onClick,
}: {
  href: string;
  icon: typeof Mic;
  title: string;
  desc: string;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-start gap-3 p-4 rounded-xl border border-gray-200 bg-white hover:border-slate-400 hover:shadow-sm transition-all"
    >
      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-slate-700" />
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-900">{title}</p>
        <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
        <p className="text-[11px] text-indigo-600 font-medium mt-1 flex items-center gap-1">
          Open <ArrowRight className="w-3 h-3" />
        </p>
      </div>
    </Link>
  );
}
