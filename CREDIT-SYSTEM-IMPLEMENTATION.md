# Credit System — Deduct + Cap Implementation Plan

> Goal: har engine par **credit balance check + deduct** lagana, har OTO ko sahi **credit allotment** dena,
> aur AI video (p-video) ko **fixed clip cap** ke saath wire karna.
> Prices reference: FE $11, OTO1 $59, OTO2 $47, OTO3 $39, OTO4 $27, OTO5 $49, OTO6 $37, OTO7 $29,
> OTO8 $39, OTO9 $79, OTO10 $49, OTO11 $69, OTO12 $169.
> Revenue split: **50% affiliate + 5% platform = 55% gone → seller net = 45%.**

---

## 0. Current State (as coded today)

| Fact | Reality |
|---|---|
| Credit column | Single `profiles.video_engine_credits` (default **10** on signup) |
| Only real grant | FE plan → seeds to **100** (`FE_SEED_CREDITS`) |
| OTO credit grants | **None** — OTOs only set `unlocked_otos[]` (feature access) |
| Deduction wired | Only Video Engine: topics=1, hooks=1, script=2, kit=3 |
| **Ungated (no deduct)** | **Thumbnail Engine, ClickBoost, Voice Studio, Video Creation Pro** |
| Unlimited (skip burn) | pro/elite/creator_pro/ultimate, or owns `oto1` / `oto9` / `oto12` |
| Video model | `REPLICATE_VIDEO_MODEL` = placeholder (not wired) |

**Launch blocker:** 4 engines ka real API cost uncapped hai. Video model missing hai.

---

## 1. Credit Costing Basis

`1 credit = $0.01 AI-cost budget.` Real API costs (live, worst-case):

| Action | Real cost | Charge (credits) | Buffer |
|---|---|---|---|
| 1 text gen (title/idea/hook/desc/script step) | ~$0.003 | **1** | 3.3× |
| Full 11-step Kit bundle | ~$0.03 | **3** (keep existing) | ~1× |
| 1 thumbnail image (Z-Image + Gemini prompt) | ~$0.007 | **2** | ~3× |
| 1 clickbait (2 A/B variants) | ~$0.012 | **3** | ~2.5× |
| 1,000 voice chars (Kokoro) | ~$0.001 | **1** | 10× |
| **1 AI video, 10s 720p (p-video)** | **$0.20** | **25** | 1.25× |
| 1 AI video, 10s 720p **draft** | $0.05 | **8** | 1.6× |

> Video clips ko credits ke alawa ek **separate lifetime clip counter** se bhi cap karo (double safety).

---

## 2. Schema Changes

### 2.1 Repurpose the existing column as a universal balance
`video_engine_credits` ko universal `credits` maano (rename optional; simplest = keep name, use everywhere).
Add a separate AI-video clip allotment counter.

```sql
-- migrations/2026xxxx_credit_system.sql
alter table public.profiles
  add column if not exists ai_video_credits integer not null default 0;
-- video_engine_credits stays as the universal text/image/voice credit pool.
```

### 2.2 (Optional, recommended later) Unified ledger
For audit + top-ups (OTO14), a `credits_ledger` table (user_id, action_type, delta, balance_after, created_at).
Not required for first launch; the two-column approach ships faster.

---

## 3. Per-OTO Credit Grants (admin grant logic)

Grant credits when an OTO is unlocked. Extend `app/api/admin/users/[id]/route.ts` (jaha FE seed hota hai).

| Offer | Price | Net (45%) | Grant `credits` | Grant `ai_video_credits` | Worst COGS | % net |
|---|---|---|---|---|---|---|
| FE | $11 | $4.95 | **60** | 0 | $0.60 | 12% |
| OTO1 VideoForge PRO | $59 | $26.55 | **450** | 0 | $4.50 | 17% |
| OTO2 VoiceStudio AI | $47 | $21.15 | **300** (=~60k voice chars) | 0 | $3.00 | 14% |
| OTO3 ClickBoost | $39 | $17.55 | **250** (~125 thumbs) | 0 | $2.50 | 14% |
| OTO4 RankPilot | $27 | $12.15 | **200** | 0 | $2.00 | 16% |
| OTO5 GrowthRadar | $49 | $22.05 | **300** | 0 | $3.00 | 14% |
| OTO6 ViralPredict | $37 | $16.65 | **220** | 0 | $2.20 | 13% |
| OTO7 WatchTime MAX | $29 | $13.05 | **180** | 0 | $1.80 | 14% |
| OTO8 Creator Toolkit X | $39 | $17.55 | **220** | 0 | $2.20 | 13% |
| OTO9 Faceless Empire | $79 | $35.55 | **500** | **5 clips** | ~$6.25 | 18% |
| OTO10 MoneyFlow | $49 | $22.05 | **250** | 0 | $2.50 | 11% |
| OTO11 Profit Accelerator | $69 | $31.05 | **350** | 0 | $3.50 | 11% |
| OTO12 Infinity | $169 | $76.05 | **1200** | **10 clips** | ~$14.50 | 19% |

> Credits are **lifetime pool** (no monthly refill). Top-up path = future OTO14.
> `ai_video_credits` = number of full-render 10s clips (each also decrements 25 from `credits`, OR treat clips as a standalone counter — pick one; recommended: **clips counter only** for video, `credits` only for text/image/voice, so video never drains the text pool).

### 3.1 Implementation sketch (admin route)

```ts
// lib/credits.ts (new)
export const OTO_CREDIT_GRANTS: Record<string, { credits: number; aiVideo: number }> = {
  fe:    { credits: 60,   aiVideo: 0 },
  oto1:  { credits: 450,  aiVideo: 0 },
  oto2:  { credits: 300,  aiVideo: 0 },
  oto3:  { credits: 250,  aiVideo: 0 },
  oto4:  { credits: 200,  aiVideo: 0 },
  oto5:  { credits: 300,  aiVideo: 0 },
  oto6:  { credits: 220,  aiVideo: 0 },
  oto7:  { credits: 180,  aiVideo: 0 },
  oto8:  { credits: 220,  aiVideo: 0 },
  oto9:  { credits: 500,  aiVideo: 5 },
  oto10: { credits: 250,  aiVideo: 0 },
  oto11: { credits: 350,  aiVideo: 0 },
  oto12: { credits: 1200, aiVideo: 10 },
};
```

When admin adds an OTO to `unlocked_otos`, **add** the grant to current balances (idempotent: only grant OTOs newly added in this request, to avoid double-granting on repeated saves).

---

## 4. Wire p-video (AI Video) + 10s / 720p

### 4.1 Env
```
REPLICATE_VIDEO_MODEL=prunaai/p-video
REPLICATE_API_TOKEN=r8_xxx
```
(`prunaai/p-video` official model → existing `owner/name` code path works.)

### 4.2 Route change — `app/api/video-creation-pro/generate/route.ts`
Pass duration + resolution (env alone can't do this):

```ts
const aspectRatio = videoType === "long" ? "16:9" : "9:16";
const prediction = await createPrediction({
  prompt,
  aspect_ratio: aspectRatio,
  duration: 10,        // 10-second clips
  resolution: "720p",  // $0.02/sec → $0.20 per clip
  // draft: true,      // optional: $0.05/clip for previews
});
```

### 4.3 Credit gate for video (add to the same route)
Video Creation Pro currently has **no** credit check. Add clip-counter gate BEFORE `createPrediction`:

```ts
// after denyUnlessFeature(user.id, "video_creation_pro")
const { data: p } = await supabase
  .from("profiles")
  .select("ai_video_credits, plan_type, unlocked_otos")
  .eq("id", user.id).single();

const unlimitedVideo = false; // AI video is NEVER unlimited (real $ cost)
const clips = typeof p?.ai_video_credits === "number" ? p.ai_video_credits : 0;
if (!unlimitedVideo && clips < 1) {
  return NextResponse.json(
    { error: "No AI video clips left. Buy a top-up to generate more." },
    { status: 402 }
  );
}
// ...after successful createPrediction():
await supabase.from("profiles")
  .update({ ai_video_credits: Math.max(0, clips - 1) })
  .eq("id", user.id);
```

> IMPORTANT: OTO9 & OTO12 unlock the *feature*, but video clips stay **capped** by `ai_video_credits`.
> Do NOT let `oto9`/`oto12` make video "unlimited" (unlike text). Remove video from the `unlimited` bypass.

---

## 5. Wire deduction into the 3 remaining ungated engines

Same pattern for each. Reuse `video_engine_credits` as the universal `credits` pool.
Create a small shared helper to avoid repetition:

```ts
// lib/credits.ts
import { createClient } from "@/lib/supabase/server";
import { ALL_ACCESS_PLANS, ownsOto } from "@/lib/features";
import { PLANS, type PlanType } from "@/lib/plans";

export async function getCreditState(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("profiles")
    .select("video_engine_credits, plan_type, unlocked_otos").eq("id", userId).single();
  const plan = ((data?.plan_type as PlanType) in PLANS ? data!.plan_type : "free") as PlanType;
  const otos = Array.isArray(data?.unlocked_otos) ? data!.unlocked_otos as string[] : [];
  const credits = typeof data?.video_engine_credits === "number" ? data.video_engine_credits : null;
  // Text/image/voice unlimited for high tiers + oto1/oto12 (NOT video).
  const unlimited =
    (ALL_ACCESS_PLANS as readonly string[]).includes(plan) ||
    plan === "pro" || ownsOto(otos, "oto1") || ownsOto(otos, "oto12");
  return { credits, unlimited };
}

export async function spendCredits(userId: string, amount: number, st: { credits: number|null; unlimited: boolean }) {
  if (st.unlimited || typeof st.credits !== "number") return;
  const supabase = await createClient();
  await supabase.from("profiles")
    .update({ video_engine_credits: Math.max(0, st.credits - amount) }).eq("id", userId);
}

export function gate(st: { credits: number|null; unlimited: boolean }, need: number) {
  if (st.unlimited || typeof st.credits !== "number") return { ok: true as const };
  if (st.credits < need) return { ok: false as const, status: 402,
    error: `Insufficient credits (need ${need}, have ${st.credits}). Buy a top-up.` };
  return { ok: true as const };
}
```

### 5.1 Thumbnail Engine — `app/api/thumbnail-engine/generate/route.ts`
- Cost: **2 credits**. Also add missing `denyUnlessFeature(user.id, "thumbnail_basic")`.
```ts
const st = await getCreditState(user.id);
const g = gate(st, 2); if (!g.ok) return NextResponse.json({ error: g.error }, { status: g.status });
// ...after image success:
await spendCredits(user.id, 2, st);
```

### 5.2 ClickBoost — `app/api/clickbait-thumbnail/generate/route.ts`
- Cost: **3 credits** (2 variants). Gate before Gemini call, deduct after image success.

### 5.3 Voice Studio — `app/api/voice-studio/generate/route.ts`
- Cost: **`ceil(script.length / 1000)` credits**. Gate on that amount, deduct after upload success.
```ts
const cost = Math.max(1, Math.ceil(script.length / 1000));
const st = await getCreditState(user.id);
const g = gate(st, cost); if (!g.ok) return NextResponse.json({ error: g.error }, { status: g.status });
// ...after storage upload:
await spendCredits(user.id, cost, st);
```

### 5.4 Video Engine (already wired)
No change needed (topics=1, hooks=1, script=2, kit=3). Optionally migrate to `lib/credits.ts` for consistency.

---

## 6. Cap Strategy

- **Lifetime pool cap** (primary): `credits` runs out → 402 "buy top-up". This is the real spend cap.
- **Daily soft cap** (abuse guard): keep existing `usage_logs` / `checkLimit` for FE per-day limits so a
  single user can't burn the whole pool in one automated burst. OTO1+ removes the daily cap (per plan),
  but the **lifetime credit pool still caps total spend.**
- **AI video hard cap:** separate `ai_video_credits` counter, never unlimited.

---

## 7. Rollout Checklist

- [x] Migration: add `ai_video_credits` column — `supabase/migrations/20260715_credit_system.sql`.
- [x] `lib/credits.ts`: shared `getCreditState` / `spendCredits` / `creditGate` / `aiVideoGate` + `OTO_CREDIT_GRANTS`.
- [x] Admin route: grant credits + clips on newly-added OTOs (idempotent).
- [x] Env: `REPLICATE_VIDEO_MODEL=prunaai/p-video` documented in `.env.local.example`.
- [x] Video route: passes `duration:10, resolution:"720p"` + clip-counter gate/deduct.
- [x] Wire deduct+gate: Thumbnail, ClickBoost, Voice Studio.
- [x] Add missing `denyUnlessFeature("thumbnail_basic")` on Thumbnail Engine.
- [x] FE seed lowered to 60 (FE = $11).
- [ ] Run the SQL migration on Supabase (manual).
- [ ] Set `REPLICATE_API_TOKEN` in `.env.local` / Vercel.
- [ ] (Optional) Update `CreditsBadge` to also show `ai_video_credits` when > 0.
- [ ] Test: FE user burns 60 → blocked; OTO3 user thumbnails deduct 2 each; voice deducts by length;
      video deducts 1 clip + blocks at 0.

## 9. Design Decision (implemented)

**No OTO is "truly unlimited" anymore — all use lifetime credit pools.** Previously `oto1`/`oto9`/`oto12`
bypassed all credit burn (uncapped API liability). Now only legacy internal high-tier plans
(`pro`/`elite`/`creator_pro`/`ultimate`) are unlimited; every OTO (including Infinity/oto12) draws from its
granted pool. This makes the per-OTO COGS numbers real and caps worst-case spend. AI video is always
clip-capped via `ai_video_credits` and never unlimited. If you want a true-unlimited flagship tier, add it
back in `getCreditState` (lib/credits.ts), `getVideoEngineCreditState` (lib/videoEngineAccess.ts), and
`computeUnlimited` (CreditsBadge.tsx).

---

## 8. Worst-Case Total Liability (sanity)

If every buyer burned their **entire** lifetime pool at worst-case rates:
- Text/image/voice OTOs: COGS 11–17% of net → healthy.
- Video OTOs (OTO9 $6.25 / OTO12 $14.50): 18–19% of net → still safe.
- Real-world usage is far lower (most credits never fully burned), so effective COGS ≈ 3–6% of net.
