/**
 * Voice style tags for VoiceStudio UI (presentation only — TTS still uses voice id).
 */

export type VoiceStyleId =
  | "narration"
  | "energetic"
  | "calm"
  | "dramatic"
  | "news"
  | "story";

export const VOICE_STYLES: {
  id: VoiceStyleId;
  label: string;
  description: string;
}[] = [
  {
    id: "narration",
    label: "Narration",
    description: "Documentary / educational calm read",
  },
  {
    id: "energetic",
    label: "Energetic",
    description: "High energy YouTube / Shorts",
  },
  {
    id: "calm",
    label: "Calm",
    description: "Soft, reassuring, ASMR-adjacent",
  },
  {
    id: "dramatic",
    label: "Dramatic",
    description: "Story / horror tension",
  },
  {
    id: "news",
    label: "News",
    description: "Clear broadcast style",
  },
  {
    id: "story",
    label: "Storytime",
    description: "Warm storytelling",
  },
];

/** Heuristic style tags per voice id prefix/name */
export function stylesForVoiceId(id: string): VoiceStyleId[] {
  const styles: VoiceStyleId[] = ["narration"];
  if (/heart|nova|sky|bella|aoede/.test(id)) styles.push("energetic", "story");
  if (/nicole|sarah|river|alloy|kore/.test(id)) styles.push("calm", "narration");
  if (/onyx|fenrir|puck|echo|santa|lewis|george/.test(id))
    styles.push("dramatic", "news");
  if (/adam|michael|liam|eric|daniel/.test(id)) styles.push("news", "narration");
  if (/alice|emma|isabella|lily|fable/.test(id)) styles.push("story", "calm");
  if (/dora|siwis|alpha|beta/.test(id)) styles.push("energetic", "news");
  if (/yun|xiao|gong|nezumi|tebukuro|kumo/.test(id))
    styles.push("narration", "story");
  return Array.from(new Set(styles));
}
