/**
 * Faceless "slideshow engine" plan — stock + captions recipe (no render pipeline).
 * Produces an edit list creators can build in CapCut/Premiere with stock footage.
 */

export type SlideshowPlan = {
  title: string;
  aspect: "16:9" | "9:16";
  music_mood: string;
  total_seconds: number;
  captions_style: string;
  clips: {
    index: number;
    start_sec: number;
    duration_sec: number;
    spoken_line: string;
    caption: string;
    stock_search: string;
    motion: string;
  }[];
  export_checklist: string[];
};

export function buildSlideshowPlan(input: {
  topic: string;
  video_type: "long" | "short";
  full_script: string;
  visual_style?: string;
}): SlideshowPlan {
  const aspect = input.video_type === "short" ? "9:16" : "16:9";
  const sentences = input.full_script
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 12)
    .slice(0, input.video_type === "short" ? 12 : 28);

  const clipDur = input.video_type === "short" ? 3.5 : 5;
  let t = 0;
  const clips = sentences.map((line, i) => {
    const start = t;
    t += clipDur;
    const words = line.split(/\s+/).slice(0, 8).join(" ");
    return {
      index: i + 1,
      start_sec: Math.round(start * 10) / 10,
      duration_sec: clipDur,
      spoken_line: line,
      caption: words.length > 42 ? words.slice(0, 40) + "…" : words,
      stock_search: `${input.topic} ${input.visual_style || "cinematic b-roll"} scene ${i + 1}`,
      motion: i % 3 === 0 ? "slow zoom in" : i % 3 === 1 ? "pan right" : "Ken Burns out",
    };
  });

  return {
    title: `Slideshow · ${input.topic}`,
    aspect,
    music_mood:
      input.video_type === "short"
        ? "trending upbeat bed, no vocals"
        : "cinematic soft underscore",
    total_seconds: Math.round(t),
    captions_style:
      "Bold center captions, 2 lines max, high contrast, pop-on word highlight",
    clips,
    export_checklist: [
      "Import stock clips matching each stock_search query (Pexels/Pixabay)",
      "Lay VO first, then snap B-roll to caption timing",
      "Apply motion (Ken Burns) per clip",
      "Burn captions or use auto-captions + style",
      "Export 1080p " + aspect,
    ],
  };
}
