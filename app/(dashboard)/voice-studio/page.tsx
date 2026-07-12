"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Mic, Loader2, Download, RefreshCw, Volume2, Clock } from "lucide-react";
import { groupVoicesByLanguage, DEFAULT_VOICE } from "@/domains/voice-studio/voices";
import { MAX_SCRIPT_CHARS, estimateDurationSeconds } from "@/domains/voice-studio/chunk";

interface GenerationResult {
  id?: string;
  audioUrl: string;
  voice: string;
  characterCount: number;
  estimatedDurationSeconds: number;
  createdAt?: string;
}

const VOICE_GROUPS = groupVoicesByLanguage();

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return mins > 0 ? `~${mins}m ${secs}s` : `~${secs}s`;
}

export default function VoiceStudioPage() {
  const [script, setScript] = useState("");
  const [voice, setVoice] = useState(DEFAULT_VOICE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [history, setHistory] = useState<GenerationResult[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  const loadHistory = async () => {
    try {
      const res = await fetch("/api/voice-studio/history");
      const data = await res.json();
      if (res.ok) {
        setHistory(
          (data.data || []).map((row: any) => ({
            id: row.id,
            audioUrl: row.audio_url,
            voice: row.voice,
            characterCount: row.character_count,
            estimatedDurationSeconds: row.duration_seconds || 0,
            createdAt: row.created_at,
          }))
        );
      }
    } catch {
      // history is a nice-to-have; ignore failures silently
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleGenerate = async () => {
    if (!script.trim() || script.length > MAX_SCRIPT_CHARS) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/voice-studio/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ script, voice }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");

      setResult(data);
      loadHistory();
    } catch (err: any) {
      setError(err.message || "Failed to generate voiceover");
    } finally {
      setLoading(false);
    }
  };

  const charCount = script.length;
  const overLimit = charCount > MAX_SCRIPT_CHARS;
  const previewDuration = estimateDurationSeconds(charCount);

  return (
    <>
      <Header
        title="Voice Studio"
        subtitle="Turn any script into a natural AI voiceover using Kokoro TTS."
      />

      <div className="p-4 md:p-8 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        {/* Input Panel */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-semibold text-gray-900">Paste your script</label>
                <span className={`text-xs font-medium ${overLimit ? "text-red-600" : "text-gray-400"}`}>
                  {charCount.toLocaleString()} / {MAX_SCRIPT_CHARS.toLocaleString()}
                </span>
              </div>
              <textarea
                value={script}
                onChange={(e) => setScript(e.target.value)}
                placeholder="Paste your full video script here..."
                className={`w-full h-56 px-4 py-3 bg-gray-50 border rounded-xl text-sm transition-all outline-none resize-none ${
                  overLimit ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-blue-500 focus:bg-white"
                }`}
              />
              <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-500">
                <Clock className="w-3.5 h-3.5" />
                {charCount > 0 ? `Estimated audio: ${formatDuration(previewDuration)}` : `Up to ~10 min of audio per generation`}
              </div>
              {overLimit && (
                <p className="mt-1 text-xs text-red-600 font-medium">
                  Script exceeds the {MAX_SCRIPT_CHARS.toLocaleString()}-character limit for a single generation.
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">Voice</label>
              <select
                value={voice}
                onChange={(e) => setVoice(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-blue-500"
              >
                {VOICE_GROUPS.map((group) => (
                  <optgroup key={group.language} label={group.language}>
                    {group.voices.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.label}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={!script.trim() || overLimit || loading}
              className="w-full py-6 text-base rounded-xl bg-blue-600 hover:bg-blue-700 shadow-md transition-all active:scale-95"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Mic className="w-5 h-5 mr-2" />}
              {loading ? "Generating voiceover..." : "Generate Voiceover"}
            </Button>

            {error && (
              <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm font-medium text-center">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Result + History Panel */}
        <div className="lg:col-span-7 space-y-6">
          {loading && (
            <div className="min-h-[220px] flex flex-col items-center justify-center bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center space-y-6">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-75" />
                <div className="relative flex items-center justify-center w-full h-full bg-blue-600 text-white rounded-full">
                  <Volume2 className="w-8 h-8 animate-pulse" />
                </div>
              </div>
              <p className="text-blue-600 font-medium animate-pulse">Synthesizing your voiceover...</p>
            </div>
          )}

          {!loading && !result && (
            <div className="min-h-[220px] flex flex-col items-center justify-center bg-gray-50/50 rounded-2xl border border-gray-200 border-dashed text-gray-400 p-8 text-center">
              <Mic className="w-14 h-14 mb-4 opacity-50" />
              <h3 className="text-lg font-semibold text-gray-700 mb-1">No Voiceover Generated</h3>
              <p className="text-sm max-w-sm">Paste a script, pick a voice, and generate your AI voiceover.</p>
            </div>
          )}

          {!loading && result && (
            <Card className="shadow-sm">
              <CardBody className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-gray-900 text-sm">Generated Voiceover</h4>
                  <span className="text-xs text-gray-500">
                    {result.characterCount.toLocaleString()} chars · {formatDuration(result.estimatedDurationSeconds)}
                  </span>
                </div>
                <audio controls src={result.audioUrl} className="w-full" />
                <div className="flex gap-3">
                  <a href={result.audioUrl} download className="flex-1">
                    <Button variant="secondary" className="w-full">
                      <Download className="w-4 h-4 mr-2" /> Download MP3
                    </Button>
                  </a>
                  <Button variant="secondary" onClick={handleGenerate} className="flex-1">
                    <RefreshCw className="w-4 h-4 mr-2" /> Regenerate
                  </Button>
                </div>
              </CardBody>
            </Card>
          )}

          {/* History */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Recent Generations</h3>
            {historyLoading ? (
              <p className="text-sm text-gray-400">Loading history...</p>
            ) : history.length === 0 ? (
              <p className="text-sm text-gray-400">No voiceovers generated yet.</p>
            ) : (
              <div className="space-y-3">
                {history.map((item) => (
                  <Card key={item.id} className="shadow-sm">
                    <CardBody className="p-4 space-y-2">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="font-medium text-gray-700">{item.voice}</span>
                        <span>
                          {item.characterCount.toLocaleString()} chars · {formatDuration(item.estimatedDurationSeconds)}
                        </span>
                      </div>
                      <audio controls src={item.audioUrl} className="w-full h-10" />
                    </CardBody>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
