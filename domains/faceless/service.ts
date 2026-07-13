import { callAI } from "@/lib/openrouter";
import { safeJsonParse } from "@/lib/utils";
import { getTemplateById, type FacelessTemplate } from "./templates";
import { buildFacelessPackagePrompt } from "./prompts";

export type FacelessPackage = {
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

function fallbackPackage(
  template: FacelessTemplate,
  topic: string
): FacelessPackage {
  const script = `Welcome. Today: ${topic}.\n\n${template.script_structure
    .map((s, i) => `Part ${i + 1}: ${s}.`)
    .join("\n\n")}\n\nIf this helped, subscribe for more ${template.niche} videos.`;
  return {
    title_options: [
      topic,
      `${topic} (faceless breakdown)`,
      `The truth about ${topic}`,
    ],
    hook: `Stop scrolling — ${topic} is about to make sense.`,
    full_script: script,
    word_count: script.split(/\s+/).length,
    estimated_minutes: 4,
    scenes: [
      {
        name: "Hook",
        spoken: `Stop scrolling — ${topic} is about to make sense.`,
        on_screen_text: "WATCH THIS",
        visual_prompt: template.visual_style,
        duration_seconds: 8,
      },
      {
        name: "Body",
        spoken: `Here's the core idea behind ${topic}.`,
        on_screen_text: "KEY POINT",
        visual_prompt: template.visual_style,
        duration_seconds: 40,
      },
      {
        name: "CTA",
        spoken: "Subscribe if you want the next video in this series.",
        on_screen_text: "SUBSCRIBE",
        visual_prompt: "end screen style graphic",
        duration_seconds: 10,
      },
    ],
    thumbnail_prompt: `${template.thumbnail_formula}. Topic: ${topic}`,
    thumbnail_text_overlay: "MUST KNOW",
    voice_direction: template.voice_style,
    video_gen_prompt: `${template.visual_style}. Topic: ${topic}`,
    tags: [template.niche, "faceless", topic.slice(0, 40)],
    description: `${topic}\n\n#${template.niche.replace(/\s+/g, "")}`,
    checklist: [
      "Generate voiceover in Voice Studio",
      "Create thumbnail in ClickBoost / Thumbnail Engine",
      "Generate AI clip in Video Creation Pro (optional)",
      "Edit captions + export",
    ],
  };
}

export async function processFacelessPackage(input: {
  template_id: string;
  topic: string;
  video_type: "long" | "short";
  extra_notes?: string;
}): Promise<{
  template: FacelessTemplate;
  package: FacelessPackage;
  version: string;
}> {
  const template = getTemplateById(input.template_id);
  if (!template) {
    throw new Error("Unknown template");
  }

  const prompt = buildFacelessPackagePrompt({
    template,
    topic: input.topic,
    video_type: input.video_type,
    extra_notes: input.extra_notes,
  });

  let pkg = fallbackPackage(template, input.topic);

  try {
    const raw = await callAI([{ role: "user", content: prompt }], {
      json: true,
      temperature: 0.55,
      max_tokens: 3500,
    });
    const parsed = safeJsonParse<Partial<FacelessPackage> | null>(raw, null);
    if (parsed && parsed.full_script) {
      pkg = {
        ...pkg,
        ...parsed,
        title_options: parsed.title_options?.length
          ? parsed.title_options
          : pkg.title_options,
        scenes: parsed.scenes?.length ? parsed.scenes : pkg.scenes,
        tags: parsed.tags?.length ? parsed.tags : pkg.tags,
        checklist: parsed.checklist?.length ? parsed.checklist : pkg.checklist,
      };
    }
  } catch {
    // keep fallback
  }

  if (!pkg.word_count && pkg.full_script) {
    pkg.word_count = pkg.full_script.split(/\s+/).filter(Boolean).length;
  }

  return {
    template,
    package: pkg,
    version: "faceless.package.v1",
  };
}
