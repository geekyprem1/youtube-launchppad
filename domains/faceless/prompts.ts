import type { FacelessTemplate } from "./templates";

export function buildFacelessPackagePrompt(input: {
  template: FacelessTemplate;
  topic: string;
  video_type: "long" | "short";
  extra_notes?: string;
}) {
  const t = input.template;
  return `You are CreatorOS Faceless Empire — a production planner for faceless YouTube channels.

Template: ${t.name} (${t.niche})
Style: ${t.style}
Tone: ${t.tone}
Visual style: ${t.visual_style}
Voice style: ${t.voice_style}
Thumbnail formula: ${t.thumbnail_formula}
Script structure guide: ${t.script_structure.join(" | ")}

Topic: "${input.topic}"
Format: ${input.video_type}
Notes: ${input.extra_notes || "(none)"}

Create a complete faceless production package. Spoken script should be ready for TTS (no stage directions inside spoken lines).

Return ONLY JSON:
{
  "title_options": ["title1", "title2", "title3", "title4", "title5"],
  "hook": "first 1-2 spoken sentences",
  "full_script": "full spoken script with paragraph breaks",
  "word_count": 0,
  "estimated_minutes": 0,
  "scenes": [
    {
      "name": "Hook",
      "spoken": "...",
      "on_screen_text": "...",
      "visual_prompt": "what to show / generate",
      "duration_seconds": 0
    }
  ],
  "thumbnail_prompt": "detailed image gen prompt",
  "thumbnail_text_overlay": "3-5 words max",
  "voice_direction": "how the TTS should sound",
  "video_gen_prompt": "single prompt for AI video / b-roll package",
  "tags": ["tag1", "..."],
  "description": "YouTube description draft",
  "checklist": ["export step 1", "..."]
}`;
}
