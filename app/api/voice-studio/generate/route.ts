import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60; // Vercel: extend timeout to 60s (free tier max)

import { randomUUID } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { denyUnlessFeature } from "@/lib/requireFeature";
import { generateSpeech } from "@/core/openrouter/tts";
import { chunkScript, estimateDurationSeconds, MAX_SCRIPT_CHARS } from "@/domains/voice-studio/chunk";
import { isValidVoice, DEFAULT_VOICE } from "@/domains/voice-studio/voices";
import { logError } from "@/core/logger";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const denied = await denyUnlessFeature(user.id, "voice_studio");
    if (denied) return denied;

    const body = await req.json();
    const script = typeof body.script === "string" ? body.script.trim() : "";
    const voice = typeof body.voice === "string" && isValidVoice(body.voice) ? body.voice : DEFAULT_VOICE;

    if (!script) {
      return NextResponse.json({ error: "Script text is required" }, { status: 400 });
    }
    if (script.length > MAX_SCRIPT_CHARS) {
      return NextResponse.json(
        { error: `Script too long. Max ${MAX_SCRIPT_CHARS} characters (~10 min of audio) per generation.` },
        { status: 400 }
      );
    }

    const chunks = chunkScript(script);
    const audioBuffers = await Promise.all(chunks.map((chunk) => generateSpeech(chunk, voice)));
    const audioBuffer = Buffer.concat(audioBuffers);

    const filePath = `${user.id}/${randomUUID()}.mp3`;
    const { error: uploadError } = await supabase.storage
      .from("voiceover-audio")
      .upload(filePath, audioBuffer, { contentType: "audio/mpeg", upsert: false });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage.from("voiceover-audio").getPublicUrl(filePath);
    const durationSeconds = estimateDurationSeconds(script.length);

    const { data: saved, error: dbError } = await supabase
      .from("voice_studio_generations")
      .insert({
        user_id: user.id,
        script_text: script,
        voice,
        audio_url: publicUrl,
        character_count: script.length,
        duration_seconds: durationSeconds,
      })
      .select("id, created_at")
      .single();

    if (dbError) {
      logError("VOICE_STUDIO_DB", dbError);
    }

    return NextResponse.json({
      ok: true,
      id: saved?.id,
      audioUrl: publicUrl,
      voice,
      characterCount: script.length,
      estimatedDurationSeconds: durationSeconds,
      createdAt: saved?.created_at,
    });
  } catch (err) {
    logError("VOICE_STUDIO_GENERATE", err);
    return NextResponse.json({ error: "Failed to generate voiceover" }, { status: 500 });
  }
}
