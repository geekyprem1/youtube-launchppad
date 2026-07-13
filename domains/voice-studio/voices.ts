// Kokoro 82M voice catalog. IDs follow hexgrad/Kokoro-82M's convention:
// first letter = language, second letter = gender, e.g. "af_bella" = American Female "Bella".
const LANGUAGE_NAMES: Record<string, string> = {
  a: "English (US)",
  b: "English (UK)",
  e: "Spanish",
  f: "French",
  h: "Hindi",
  i: "Italian",
  j: "Japanese",
  p: "Portuguese",
  z: "Chinese",
};

const GENDER_NAMES: Record<string, string> = { f: "Female", m: "Male" };

const VOICE_IDS = [
  "af_alloy", "af_aoede", "af_bella", "af_heart", "af_jessica", "af_kore",
  "af_nicole", "af_nova", "af_river", "af_sarah", "af_sky",
  "am_adam", "am_echo", "am_eric", "am_fenrir", "am_liam", "am_michael",
  "am_onyx", "am_puck", "am_santa",
  "bf_alice", "bf_emma", "bf_isabella", "bf_lily",
  "bm_daniel", "bm_fable", "bm_george", "bm_lewis",
  "ef_dora", "em_alex",
  "ff_siwis",
  "hf_alpha", "hf_beta", "hm_omega", "hm_psi",
  "if_sara", "im_nicola",
  "jf_alpha", "jf_gongitsune", "jf_nezumi", "jf_tebukuro", "jm_kumo",
  "pf_dora", "pm_alex", "pm_santa",
  "zf_xiaobei", "zf_xiaoni", "zf_xiaoxiao", "zf_xiaoyi",
  "zm_yunjian", "zm_yunxi", "zm_yunxia", "zm_yunyang",
];

import { stylesForVoiceId, type VoiceStyleId } from "./styles";

export interface VoiceOption {
  id: string;
  name: string;
  languageCode: string;
  language: string;
  gender: "Female" | "Male";
  label: string;
  /** UI style tags (not separate TTS engines) */
  styles: VoiceStyleId[];
  premium?: boolean;
}

export const VOICES: VoiceOption[] = VOICE_IDS.map((id) => {
  const [prefix, name] = id.split("_");
  const languageCode = prefix[0];
  const genderCode = prefix[1];
  const language = LANGUAGE_NAMES[languageCode] || languageCode;
  const gender = (GENDER_NAMES[genderCode] || genderCode) as "Female" | "Male";
  const displayName = name.charAt(0).toUpperCase() + name.slice(1);
  const styles = stylesForVoiceId(id);
  const premium = !languageCode.startsWith("a") && !languageCode.startsWith("b");
  return {
    id,
    name: displayName,
    languageCode,
    language,
    gender,
    label: `${displayName} — ${gender}${premium ? " · Multi-lang" : ""}`,
    styles,
    premium,
  };
});

export const DEFAULT_VOICE = "af_heart";

export function isValidVoice(id: string): boolean {
  return VOICES.some((v) => v.id === id);
}

export function groupVoicesByLanguage(): { language: string; voices: VoiceOption[] }[] {
  const order = Object.values(LANGUAGE_NAMES);
  const groups = new Map<string, VoiceOption[]>();
  for (const voice of VOICES) {
    if (!groups.has(voice.language)) groups.set(voice.language, []);
    groups.get(voice.language)!.push(voice);
  }
  return order
    .filter((lang) => groups.has(lang))
    .map((language) => ({ language, voices: groups.get(language)! }));
}
