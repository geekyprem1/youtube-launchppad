# YT Launchpad — 14-Offer Funnel Plan

Prepared: 2026-07-03
Ceiling: $170 · Commission: 50% (JVZoo/WarriorPlus style) · Basis: real OpenRouter/SiliconFlow/Replicate pricing (July 2026)

Live version with tables/visuals: `YT-Launchpad-Funnel-Blueprint.pdf` (same folder) or https://claude.ai/code/artifact/c7c69656-1945-470a-bed7-85bb5e36417e

---

## 0. Critical risks (fix before selling anything)

1. **No credit enforcement on 4 of 5 engines.** Thumbnail Engine, Clickbait Thumbnail, Voice Studio, and Video Creation Pro only check `if (!user)` — no usage cap. Only Video Engine deducts credits today. Launch-day traffic without a cap = unlimited real API cost with no revenue offset.
2. **Video model not wired.** `REPLICATE_VIDEO_MODEL` is still the placeholder `owner/model-name` in `.env.local`. Must pick + cost-test a real model before pricing OTO8.
3. **Lifetime pools, not monthly refills.** A one-time fee funding a free monthly credit refill forever is an uncapped liability. Every allotment below is a lifetime pool, paired with a paid top-up path (see §4).

---

## 1. Cost basis (per generation, buffered for safety)

| Action | Model / API | Real cost | Priced at |
|---|---|---|---|
| 1 text generation (topic/hook/script) | gemini-2.5-flash via OpenRouter | ≈$0.0014 | $0.01 = 1 credit |
| Full 11-call "Kit" bundle | gemini-2.5-flash × 11 | ≈$0.016 | $0.08 = 8 credits |
| 1 thumbnail/clickbait image | flash prompt + Z-Image-Turbo | ≈$0.007 | $0.02 = 2 credits |
| 1,000 characters AI voiceover | kokoro-82m via OpenRouter | ≈$0.001 | $0.01 = 1 credit |
| 1 AI-generated 30-sec video clip | Replicate, Wan-class budget model | ≈$1.20–$2.40 | $2.00 = 200 credits |

Every offer is priced so **lifetime credits × $0.01 ≈ 5–6% of the sale price**, worst case (buyer maxes every credit day one).

---

## 2. The 14 offers

| # | Offer | Price | Unlocks | Credits (lifetime) | Worst-case COGS | Pain point |
|---|---|---|---|---|---|---|
| FE | YT Launchpad — Core | $17 | Video Engine (topics/hooks/scripts) + basic Thumbnail Engine | 100 | $1.00 (5.9%) | "I don't know what to post next" |
| OTO1 | Unlimited TURBO | $37 | Removes daily cap + full 11-step Kit + Clickbait Thumbnail tool | 200 | $2.00 (5.4%) | "One video a week isn't enough" |
| OTO2 | Unlimited THUNDERBOLT | $67 | + Voice Studio voiceovers, priority queue | 350 (incl. 15k voice chars) | $3.50 (5.2%) | "I can't/won't record my own voice" |
| OTO3 | DFY Content Pack — Silver | $27 | 100 done-for-you scripts/hooks/thumbnail templates (static) | 0* | ~$0 | "I don't trust raw AI output" |
| OTO4 | DFY Content Pack — Gold | $47 | 300 niche packs + monthly trend refresh | 0* | <$0.10/mo | Deeper niche coverage |
| OTO5 | Traffic & Virality Booster | $37 | Trending topic finder + AI title CTR scorer | 200 | $2.00 (5.4%) | "My videos don't get clicked" |
| OTO6 | Clickbait Thumbnail Pro | $47 | Standalone tool, 2 A/B variants per request | 250 img | $2.50 (5.3%) | "My thumbnails look homemade" |
| OTO7 | Voice Studio Pro | $67 | Expanded voice library + 5 custom clones | 350 (35k chars) | $3.50 (5.2%) | "I hate my own voice" / multi-language |
| OTO8 | Video Creation Pro | $97 | Unlimited template/slideshow video + 4 true AI clips lifetime | 500 + 4 video | $5.80 (~6%) | "I don't want to edit or show my face" |
| OTO9 | Channel Monetization Toolkit | $37 | Strategy reports, sponsorship pitch + rate-card generator | 200 | $2.00 (5.4%) | "I don't know how to make money from this" |
| OTO10 | Viral Success Masterclass | $47 | Video training + PDF playbooks (pure content) | 0* | ~$0 | "I understand the tool, not the strategy" |
| OTO11 | Multi-Channel / Global License | $67 | Use across 5 additional channels/brands | 350 | $3.50 (5.2%) | "I run more than one channel" |
| OTO12 | Agency & Client License | $127 | Generate for up to 10 client channels + white-labeled client reports | 700 | $7.00 (5.5%) | "I want to sell this as a service" |
| OTO13 | Whitelabel + Reseller Rights | $167 | Rebrand as their own, keep 100% resale revenue | 900 | $9.00 (5.4%) | "I want to sell this exact software under my name" |

\* Static/content offers carry no per-unit AI cost beyond one-time template creation — safest revenue in the funnel.

**OTO8 note:** don't market "unlimited AI video" — a real clip costs $1.20–$2.40+. Split it: unlimited template-based slideshow video (stock footage + pan + existing TTS + captions, near-zero cost) as the bulk deliverable, plus a small lifetime allotment of true AI clips, plus paid top-ups for more.

---

## 3. Commission math (why 5–6% COGS is the safe target)

Per $100 sold:

| | |
|---|---|
| Gross sale price | $100.00 |
| − Affiliate commission (50%) | −$50.00 |
| − Platform + processor fees (~4%) | −$4.00 |
| − Refund reserve (typical IM-launch, 15–18%) | −$16.00 |
| **Realistic net you can count on** | **≈$30.00** |

Worst-case COGS of 5–6% of gross is ~17–20% of that realistic $30 net — still leaves roughly three-quarters of it as clean profit even if every assumption holds at its worst.

---

## 4. Beyond the 14

- **Shorts/Reels Auto-Repurposer** — chops long-form into captioned Shorts; reuses existing cheap text credits, near-zero new COGS, highest-demand feature right now.
- **Comment & Community AI Assistant** — drafts reply suggestions to boost engagement; pure text credits.
- **Monthly "Fuel Tank" Top-Up ($27–47/mo)** — do this one. Every offer above is a lifetime pool, so buyers will run out eventually — that's the upsell moment, not a support ticket. This is the ongoing-profit engine the one-time funnel is missing.

---

## 5. Build roadmap — what actually needs to be made

### 5.1 Foundation (build once, applies to everything)

- [ ] **Unified credit ledger** — replace the single `profiles.video_engine_credits` column with a `credits_ledger` table tracking per-user, per-action-type (text/image/voice/video) balance.
- [ ] **Wire credit deduction into the 4 ungated routes** — Thumbnail Engine, Clickbait Thumbnail, Voice Studio, Video Creation Pro route.ts files currently only check `if (!user)`. Add balance check + deduct + graceful "out of credits" response.
- [ ] **Entitlements table** — replace single `plan_type` with a `purchases`/`entitlements` table listing which of the 14 products each user owns, since this is 14 separately-sold products, not one subscription tier. Every route's access check moves from `plan_type` to "does user own this entitlement."
- [ ] **Real video model wired** — pick a specific Wan-class budget model on Replicate, load-test it, confirm actual $/clip, replace the `owner/model-name` placeholder.

### 5.2 Per-offer builds

| Offer | Status | What's needed |
|---|---|---|
| FE, OTO1, OTO2 | Core logic exists | Remove daily cap, connect to new credit ledger — small |
| OTO3, OTO4 | Nothing built | Not code — content production: 100–300 templates to write/curate |
| OTO5 | Text-gen infra exists | Needs a **real trending-data source** (YouTube Data API / Google Trends) — without it, "trending" claim is just AI guesswork |
| OTO6 | Image-gen exists | Add "2 variants per request" loop — small |
| OTO7 | Only fixed-voice TTS (kokoro-82m) exists | **Voice cloning is a new feature** — kokoro doesn't support cloning. Either integrate a cloning-capable provider (ElevenLabs-class) or drop the "clone" claim and sell extra preset voices instead. Decide before pricing this OTO. |
| OTO8 | Replicate call skeleton exists, model missing | Two builds: (1) wire real AI-video model, (2) **build the slideshow engine from scratch** — stock footage API (Pexels/Pixabay) + Ken Burns pan + caption overlay + existing TTS, composed into video. Doesn't exist anywhere in the codebase today. |
| OTO9 | Text-gen infra exists | New prompts/report templates — moderate |
| OTO10 | Nothing built | Not code — record video course + write PDF playbooks |
| OTO11 | Needs verification | Check if app supports multiple channels/workspaces per user; if not, add that concept |
| OTO12 | Nothing built | Client management (mini-CRM for multiple client channels) + white-labeled PDF export — medium-size feature |
| OTO13 | Nothing built | **Biggest build**: rebrand system (logo/name swap) + a way for resellers to resell to their own customers — either a multi-tenant white-label system (custom domain/logo per reseller) or a separate deployable instance per buyer |

### 5.3 Content production (no code)

- [ ] DFY Silver pack — 100 scripts/hooks/thumbnail templates
- [ ] DFY Gold pack — 300 niche-specific templates + monthly trend refresh process
- [ ] Viral Success Masterclass — video training + PDF playbook
- [ ] 14 sales pages / OTO upsell page copy

### 5.4 Payment & launch platform

- [ ] Register all 14 products on JVZoo/WarriorPlus, configure the OTO upsell sequence
- [ ] Build a webhook handler per product (same pattern as existing `app/api/webhooks/stripe/route.ts`) that grants the correct entitlement when JVZoo/WarriorPlus confirms payment
- [ ] Affiliate 50% commission is configured directly in the JVZoo/WarriorPlus dashboard, not in app code

---

## 6. Open decisions before building

1. **OTO7 voice cloning** — integrate a real cloning provider, or reposition the offer around preset voices only?
2. **OTO8 video model** — which specific Replicate model, and has its real per-clip cost been confirmed with a test run?
3. **OTO13 whitelabel mechanism** — multi-tenant re-skin vs. separate instance per reseller — this decision drives most of the OTO13 build effort and should be made first.
