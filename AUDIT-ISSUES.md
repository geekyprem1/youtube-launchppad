# YT Launchpad — Audit Issues Report

**Date:** 2026-07-24
**Scope:** Full codebase audit — feature working status, pipeline correctness, real vs mock data, bugs.
**Method:** TypeScript typecheck (`tsc --noEmit`), API route tracing, data-flow analysis (mock vs live API).

---

## ✅ Verified Working (Real Pipelines)

| Feature | Status | Data Source |
|---|---|---|
| TypeScript compile | ✅ Clean | `tsc --noEmit` → exit 0, no type errors |
| Auth + feature gating | ✅ Correct | `auth.getUser()` → `denyUnlessFeature()` → `checkLimit()` → `incrementUsage()` |
| Competitors | ✅ Real | Live YouTube Data API (`fetchCompetitorData`) |
| Keywords | ✅ Real | YouTube search + OpenRouter AI |
| Titles / Channel Engine / Toolkit | ✅ Real | OpenRouter AI |
| Thumbnail Engine | ✅ Real | SiliconFlow image gen + Supabase re-hosting |
| Video Creation Pro | ✅ Real | Replicate API (create/poll pattern) |

Graceful fallbacks (Zod validation + fallback JSON) are present across all AI routes.

---

## 🐛 Issues Found

### 1. [CRITICAL] Predictor serves fake hardcoded metrics
- **File:** `domains/prediction/data.ts` → `fetchPredictionData()`
- **Wired into:** `app/api/predictor/route.ts` (live)
- **Problem:** Returns identical hardcoded values for **every** topic:
  ```ts
  return { titleLength: title.length, keywordDensity: 0.6, searchDemand: 45000, competitorVolume: 12 };
  ```
- **Impact:** Estimated CTR, retention, demand score, saturation score are fabricated and identical regardless of user input. Only the AI reasoning text varies.
- **Fix direction:** Replace with live YouTube Data API pipeline (like `competitors` domain does).

---

### 2. [CRITICAL] Ideas / Recommendations serve fake ROI
- **File:** `domains/recommendations/data.ts` → `fetchNicheData()`
- **Wired into:** `app/api/ideas/route.ts` (live)
- **Problem:** Returns hardcoded niche data:
  ```ts
  return { searchVolume: 120000, competitionLevel: "Medium", trendMomentum: 1.2, historicalSuccessRate: ..., seasonalityMultiplier: 1.0, audienceMatchScore: 85 };
  ```
- **Impact:** ROI reach/subs projections (`reachMin`, `reachMax`, `subsMin`, `subsMax` in `service.ts`) are computed from fake `searchVolume` → fabricated numbers. (Idea topics themselves come from real AI.)
- **Fix direction:** Feed real search volume / trend data (YouTube API / trends) into `fetchNicheData`.

---

### 3. [HIGH] AI Coach serves fake "memory"
- **File:** `domains/coach/data.ts` → `fetchCoachContext()`
- **Wired into:** `app/api/coach/chat/route.ts` (live)
- **Problem:** Returns hardcoded context for **every** user:
  ```ts
  return { userId, recentUploads: 2, currentGoal: "Reach 100k subscribers by Q4", unresolvedIssues: 3 };
  ```
- **Impact:** "Personalized" coach gives the same context/goal to all users. Not user-specific.
- **Fix direction:** Load real user data (uploads count, goals from DB, diagnostics results).

---

### 4. [MEDIUM] Video Engine hook scores are non-deterministic
- **File:** `domains/video-engine/scoring.ts` → `scoreHookConfidence()`
- **Wired into:** `app/api/video-engine/hooks/route.ts` (live)
- **Problem:** Uses `Math.random()` for ±5 variance:
  ```ts
  const variance = Math.floor(Math.random() * 11) - 5;
  ```
- **Impact:** Same hook shows a different confidence score on every call/refresh. Also inconsistent between cache-hit (stored score) and cache-miss (re-randomized) paths.
- **Fix direction:** Make scoring deterministic (remove random, or seed from hook text/type).

---

### 5. [MEDIUM] Video Engine topics use simulated data
- **File:** `domains/video-engine/scoring.ts` → `simulateNicheFeatures()`
- **Wired into:** `app/api/video-engine/topics/route.ts` (live)
- **Problem:** Generates demand/competition/trend numbers from a niche-string hash — deterministic but not real market data.
- **Fix direction:** Replace with live data source, or clearly label as an estimate in the UI.

---

### 6. [VERIFY] Voice Studio TTS endpoint may not exist
- **File:** `core/openrouter/tts.ts` → `generateSpeech()`
- **Wired into:** `app/api/voice-studio/generate/route.ts` (live)
- **Problem:** Calls `https://openrouter.ai/api/v1/audio/speech`. OpenRouter typically does **not** expose a TTS / audio-speech endpoint — this may fail in production.
- **Note:** `debug_audio_output.bin` (24 KB) exists in repo, suggesting it was tested at some point.
- **Fix direction:** Verify with a live API key; if unsupported, switch to a real TTS provider (e.g., ElevenLabs, OpenAI TTS, or a Replicate TTS model).

---

## Summary

- **Architecture, auth, gating, and the image/video/keyword/competitor features are solid and use real data.**
- **Main problem:** Predictor (#1), Ideas ROI (#2), and Coach (#3) serve mock/hardcoded data to users as if they were real results.
- **Plus:** hook scoring randomness bug (#4), simulated topic data (#5), and an unverified TTS endpoint (#6).

**Priority order to fix:** #1 → #2 → #3 → #4 → #6 → #5

---

## ✅ Resolution Log (2026-07-24)

All issues fixed. `npx tsc --noEmit` → exit 0 (clean).

**New shared helper:** `lib/youtube.ts` → `getTopicInsights(query)` — fetches top videos + real view statistics and computes demand (median views), competition (recent-video density), keyword coverage, and view-trend momentum. Returns `available: false` for graceful fallback when no API key.

| # | Fix | Result |
|---|---|---|
| 1 | `domains/prediction/data.ts` `fetchPredictionData` now derives `searchDemand`, `competitorVolume`, `keywordDensity` from `getTopicInsights`. Falls back to old defaults if API unavailable. `data_source` surfaced in response. | Real per-topic metrics |
| 2 | `domains/recommendations/data.ts` `fetchNicheData` now derives `searchVolume`, `competitionLevel`, `trendMomentum`, `audienceMatchScore` from live YouTube data. `data_source` surfaced. | Real ROI inputs |
| 3 | `domains/coach/data.ts` `fetchCoachContext(userId, supabase)` now queries real per-user activity (retention_analyses / title_scores / ideas, last 30d); derives `unresolvedIssues` from cadence + backlog; goal = "not set" (coach asks). Supabase threaded through service + route. | User-specific context |
| 4 | `domains/video-engine/scoring.ts` `scoreHookConfidence` now deterministic (variance from hook-text hash, no `Math.random`). Route passes `h.text` on both cache-hit AND cache-miss paths. | Stable, consistent scores |
| 5 | `domains/video-engine/scoring.ts` new `nicheFeaturesFromInsights`; topics route uses real YouTube features with `simulateNicheFeatures` fallback + `data_source` label. | Real topic scoring |
| 6 | `core/openrouter/tts.ts` — **verified endpoint is correct** (OpenRouter does support `/api/v1/audio/speech`; request shape + Kokoro voice IDs match spec). Added error surfacing (`details`) in `voice-studio/generate` route. | No bug; better diagnostics |

**Note:** Real-data paths require `YOUTUBE_API_KEY` to be set. Without it, each feature falls back gracefully to conservative defaults instead of crashing.

