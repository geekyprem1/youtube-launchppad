// Kokoro's context window is ~4K chars per call, so long scripts must be split
// into sentence-aligned chunks and generated separately, then stitched together.
const MAX_CHUNK_CHARS = 3000;
export const MAX_SCRIPT_CHARS = 9000;

export function chunkScript(text: string, maxChars = MAX_CHUNK_CHARS): string[] {
  const sentences = text.match(/[^.!?]+[.!?]+(\s+|$)|[^.!?]+$/g) || [text];
  const chunks: string[] = [];
  let current = "";

  for (const sentence of sentences) {
    if (sentence.length > maxChars) {
      if (current.trim()) {
        chunks.push(current.trim());
        current = "";
      }
      for (let i = 0; i < sentence.length; i += maxChars) {
        chunks.push(sentence.slice(i, i + maxChars).trim());
      }
      continue;
    }
    if ((current + sentence).length > maxChars) {
      chunks.push(current.trim());
      current = sentence;
    } else {
      current += sentence;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks.filter(Boolean);
}

// Rough estimate only (~5.5 chars/word at ~150 words/min narration pace) —
// Kokoro doesn't report actual duration, so this is shown as "~N min" in the UI.
export function estimateDurationSeconds(characterCount: number): number {
  const words = characterCount / 5.5;
  return Math.round((words / 150) * 60);
}
