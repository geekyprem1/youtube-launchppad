# CreatorOS AI — Complete Architecture + Phase Plan

> Source PDF: `CreatorOS_AI_Complete_OTO_Guide.pdf`  
> Prepared against live codebase: **YT Launchpad / CreatorOS AI**  
> Date: 2026-07-12

---

## 0. Important note (2 plans exist)

| Document | Offers | Status |
|---|---|---|
| **PDF (this plan)** | CreatorOS OTO 1–12 | **Canonical product map** |
| `OTO-FUNNEL-PLAN.md` / `OTO-DETAILED-BREAKDOWN.md` | Old 14-offer JVZoo funnel | Older pricing/credits model — keep as cost reference only |

This document maps **PDF OTO 1–12** → existing code → gaps → architecture → build phases.

---

## 1. What's already built (audit)

### 1.1 Stack (live)

| Layer | Tech |
|---|---|
| Framework | Next.js 14 (App Router) |
| UI | React 18, Tailwind, lucide-react, framer-motion, recharts |
| Auth + DB | Supabase (SSR + client) |
| AI text | OpenRouter (`core/openrouter`) |
| AI image | Replicate / thumbnail routes |
| AI voice | OpenRouter TTS / kokoro (`core/openrouter/tts.ts`) |
| AI video | Replicate skeleton (`core/replicate`) — model still placeholder risk |
| Payments | Stripe webhook (`app/api/webhooks/stripe`) |
| Plans | `lib/plans.ts` + `lib/planLimits.ts` (subscription-style, **not** OTO entitlements) |

### 1.2 App modules already in repo

| Module | UI route | API | Domain / schema | Maturity |
|---|---|---|---|---|
| Channel Engine (audit) | `/dashboard`, history | `/api/channel-engine/analyze`, `/api/dashboard` | `domains/channel-engine`, `channel_engine_schema.sql` | **Strong** |
| Video Engine (wizard) | `/video-engine/*` | topics, hooks, script, kit, session | `domains/video-engine`, `video_engine_schema.sql` | **Strong** (credits only here) |
| Voice Studio | `/voice-studio` | generate, history | `domains/voice-studio`, `voice_studio_schema.sql` | **Medium** (preset TTS; no cloning) |
| Recommendation Engine | `/ideas` | `/api/ideas` | `domains/recommendations` | **Strong** |
| Toolkit Engine | `/toolkit` + history | generate, regenerate | `domains/toolkit-engine`, `toolkit_engine_schema.sql` | **Strong** |
| Thumbnail Pro Engine | `/thumbnail-engine` + history | generate, enhance | `domains/thumbnail-engine`, `thumbnail_engine_schema.sql` | **Strong** (credit gate weak) |
| Clickbait Thumbnail | `/clickbait-thumbnail` | generate, history | `domains/clickbait-thumbnail`, schema | **Strong** (credit gate weak) |
| Video Creation Pro | `/video-creation-pro` | generate, enhance, status, history | `domains/video-creation-pro`, schema | **Medium** (model wiring risk) |
| Success Predictor | `/predictor` | `/api/predictor` | `domains/prediction` | **Strong** |
| Title & Thumbnail optimize | `/optimize` | `/api/titles`, `/api/thumbnails` | — | **Medium** |
| Retention Analyzer | `/retention` | `/api/retention` | (related diagnostics) | **Medium** |
| Competitor Intel | `/competitors` | `/api/competitors` | `domains/competitors` | **Strong** |
| Keyword Research | `/keywords` | `/api/keywords` | — | **Medium** |
| AI Coach (chat) | `/coach` + floating chat | `/api/coach/chat` | `domains/coach` | **Medium** |
| Admin | `/admin` | `/api/admin/users` | `admin_schema.sql` | **Basic** |
| Pricing / Stripe | `/pricing` | webhook | `lib/stripe.ts` | **Basic** |
| Auth | `/login`, `/signup`, callback | middleware | Supabase | **Done** |

### 1.3 Shared infrastructure already present

```
core/
  cache/          — response caching helpers
  logger/         — logging
  openrouter/     — LLM + TTS clients
  replicate/      — image/video generation client
  scoring/        — shared scoring utilities
  validation/     — request validation

lib/
  plans.ts        — free/starter/pro/elite/creator_pro/ultimate
  planLimits.ts   — daily usage checks
  youtube.ts      — YouTube data helpers
  supabase/*      — client/server/admin

supabase/
  schema.sql + per-engine schemas + migrations
```

### 1.4 Explicitly NOT built yet

| Gap | Why it matters |
|---|---|
| **MoneyFlow (OTO 10)** | No monetization/RPM/affiliate/sponsorship UI or API |
| **Profit Accelerator (OTO 11)** | No revenue planner / digital product planner / ROI tracker / brand deals |
| **OTO entitlements system** | Still single `plan_type`, not product ownership |
| **Unified credit ledger** | Only `video_engine_credits`; other engines mostly ungated |
| **A/B Test Simulator** (ViralPredict) | Predictor exists; true A/B sim does not |
| **RankPilot as dedicated product** | Pieces in `/optimize` + titles API; no full “upload checklist” product |
| **Faceless Empire as bundle product** | Tools exist separately; no bundled workflow + faceless template pack |
| **Infinity VIP layer** | No “own all OTOs” entitlement + VIP extras |
| **JVZoo/WarriorPlus product webhooks** | Only Stripe today |
| **Slideshow video engine** | True low-cost unlimited faceless pipeline not built |
| **Voice cloning** | Not supported by current TTS path |

---

## 2. PDF OTO → code mapping (status matrix)

| # | PDF product | Price | Features (PDF) | Maps to existing code | Status |
|---|---|---|---|---|---|
| **OTO 1** | **VideoForge PRO** | $47 | Long Video Maker, Shorts Maker, AI Script, Topic, Description, Hashtag | Video Engine (topics/hooks/script/kit/export) + video-type (incl. Shorts/faceless) + Video Creation Pro | **~85% built** — need product packaging + Shorts-specific polish + credit gate |
| **OTO 2** | **VoiceStudio AI** | $59 | AI Voice, Premium Voices, Multi-lang, Styles, Downloads | Voice Studio + voices list + history download | **~70% built** — expand voice library/styles; no cloning |
| **OTO 3** | **ClickBoost** | $39 | Thumbnail Generator, Analyzer, CTR Suggestions, Templates | Thumbnail Engine + Clickbait Thumbnail + titles/thumbnails APIs | **~80% built** — unify under ClickBoost brand; add templates pack + analyzer scoring UX |
| **OTO 4** | **RankPilot** | $27 | Title Analyzer, SEO Optimizer, CTR Optimizer, Upload Suggestions | `/optimize` + `/api/titles` + keywords partial | **~45% built** — needs dedicated RankPilot flow + upload checklist |
| **OTO 5** | **GrowthRadar** | $49 | Channel Audit, Recommendation Engine, Competitor Intel, Keyword Research | Dashboard audit + `/ideas` + `/competitors` + `/keywords` | **~90% built** — package as one product; optional real trends data |
| **OTO 6** | **ViralPredict** | $37 | Success Predictor, Predict Before Publish, A/B Test Simulator | `/predictor` + prediction domain | **~60% built** — predictor OK; **A/B simulator missing** |
| **OTO 7** | **WatchTime MAX** | $29 | Retention Analyzer, Drop-off Analysis, AI Retention Tips | `/retention` + diagnostics domain | **~70% built** — deepen drop-off viz + tip quality |
| **OTO 8** | **Creator Toolkit X** | $39 | Toolkit Engine, Creator Assets, Publishing Toolkit, Templates | `/toolkit` + toolkit-engine API/schema | **~75% built** — assets library + publishing checklist/templates |
| **OTO 9** | **Faceless Empire** | $79 | AI Video Engine, AI Voice, Script AI, Thumbnail Gen, Faceless Templates | Video Engine + Voice Studio + Thumbnail + Video Creation Pro | **~65% built as pieces** — need **guided faceless pipeline** + template pack (bundle product) |
| **OTO 10** | **MoneyFlow** | $49 | Monetization Roadmap, RPM/CPM Tools, Affiliate Finder, Sponsorship Kit, AdSense Checklist | *None dedicated* (channel audit has monetization_readiness score only) | **~5% built** — **net-new product** |
| **OTO 11** | **Profit Accelerator** | $69 | Revenue Planner, Digital Product Planner, ROI Tracker, Brand Deal Toolkit | *None* | **0% built** — **net-new product** |
| **OTO 12** | **Infinity** | $169 | All tools + Future Updates + Premium Templates + VIP Access | All modules + plan “ultimate” conceptually | **Packaging only** — needs entitlements + VIP extras |

**Rough completion:** OTO 1–9 infrastructure heavy (~70% code exists). OTO 10–11 greenfield. OTO 12 = commerce + entitlement layer.

---

## 3. Complete system architecture

### 3.1 High-level (CreatorOS)

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT (Next.js App)                         │
│  Landing / Sales  │  Auth  │  Dashboard Shell  │  OTO Product UIs    │
└─────────────┬───────────────────────┬───────────────────┬───────────┘
              │                       │                   │
              ▼                       ▼                   ▼
┌─────────────────────┐   ┌─────────────────────┐   ┌──────────────────┐
│  Entitlement Guard  │   │  Credits Middleware │   │  Feature Router  │
│  (owns product X?)  │   │  (ledger debit)     │   │  (OTO → modules) │
└──────────┬──────────┘   └──────────┬──────────┘   └────────┬─────────┘
           │                         │                       │
           └────────────┬────────────┴───────────┬───────────┘
                        ▼                        ▼
              ┌──────────────────┐    ┌──────────────────────┐
              │  Domain Services │    │  Core Providers      │
              │  (per OTO/engine)│    │  OpenRouter / Repl.  │
              └────────┬─────────┘    │  YouTube / Stripe    │
                       │              └──────────┬───────────┘
                       ▼                         ▼
              ┌──────────────────────────────────────────────┐
              │                 Supabase                      │
              │  auth │ profiles │ entitlements │ credits     │
              │  usage │ engine tables │ history │ admin      │
              └──────────────────────────────────────────────┘
```

### 3.2 Product → module architecture (PDF-aligned)

```
CreatorOS AI
├── FE (Core / included free or base)     [optional front-end offer]
│   └── Light access: 1–2 engines teaser + low credits
│
├── OTO1 VideoForge PRO
│   ├── Video Engine wizard (topic → hook → script → kit → export)
│   ├── Long-form path
│   ├── Shorts path
│   ├── Description + hashtag generators (kit)
│   └── Optional: Video Creation Pro clips
│
├── OTO2 VoiceStudio AI
│   ├── TTS generate
│   ├── Voice library (premium + multi-lang + styles)
│   └── Download + history
│
├── OTO3 ClickBoost
│   ├── Thumbnail Pro Engine
│   ├── Clickbait Thumbnail Maker
│   ├── Thumbnail analyzer / CTR tips
│   └── Template gallery
│
├── OTO4 RankPilot
│   ├── Title analyzer + SEO optimizer
│   ├── CTR optimizer (title/thumb pair)
│   └── Pre-publish upload suggestions checklist
│
├── OTO5 GrowthRadar
│   ├── Channel Engine audit
│   ├── Recommendation Engine (/ideas)
│   ├── Competitor Intel
│   └── Keyword Research
│
├── OTO6 ViralPredict
│   ├── Success Predictor
│   ├── Pre-publish score
│   └── A/B Test Simulator (title/thumb variants)
│
├── OTO7 WatchTime MAX
│   ├── Retention Analyzer
│   ├── Drop-off analysis
│   └── AI retention tips
│
├── OTO8 Creator Toolkit X
│   ├── Toolkit Engine
│   ├── Creator assets library
│   ├── Publishing toolkit
│   └── Templates
│
├── OTO9 Faceless Empire (BUNDLE)
│   ├── Script AI (Video Engine)
│   ├── AI Voice (Voice Studio)
│   ├── Thumbnail Gen (ClickBoost engines)
│   ├── AI Video / slideshow path
│   └── Faceless templates + guided pipeline
│
├── OTO10 MoneyFlow (NEW)
│   ├── Monetization roadmap generator
│   ├── RPM/CPM calculator + niche benchmarks
│   ├── Affiliate finder (niche → programs)
│   ├── Sponsorship pitch + rate card
│   └── AdSense eligibility checklist
│
├── OTO11 Profit Accelerator (NEW)
│   ├── Revenue planner (multi-stream)
│   ├── Digital product planner
│   ├── ROI tracker (manual + estimated)
│   └── Brand deal toolkit
│
└── OTO12 Infinity
    ├── Entitlement: ALL products
    ├── Premium template pack
    ├── Priority / VIP support flag
    └── Future feature auto-unlock
```

### 3.3 Data model (target architecture)

```sql
-- 1) Product catalog (static seed)
products (
  id text primary key,          -- 'videoforge_pro', 'voicestudio_ai', ...
  oto_number int,               -- 1..12
  name text,
  price_cents int,
  features jsonb                -- list of feature keys
)

-- 2) What the user owns
entitlements (
  id uuid pk,
  user_id uuid → auth.users,
  product_id text → products,
  source text,                  -- 'stripe' | 'jvzoo' | 'manual' | 'bundle'
  granted_at timestamptz,
  expires_at timestamptz null,  -- null = lifetime
  meta jsonb
)

-- 3) Unified credits (lifetime pools + top-ups)
credits_ledger (
  id uuid pk,
  user_id uuid,
  credit_type text,             -- 'text' | 'image' | 'voice_chars' | 'video_clip'
  delta int,                    -- +grant / -consume
  balance_after int,
  reason text,                  -- 'purchase:oto1' | 'consume:script' | 'topup'
  ref_id text null,             -- generation id / payment id
  created_at timestamptz
)

-- 4) Keep existing engine history tables
-- channel_audits, video_engine_sessions, voice_jobs, thumbnails, toolkit_runs, etc.
```

**Access rule (every protected API):**

1. Authenticated user  
2. `hasEntitlement(user, productOrFeature)` OR owns Infinity  
3. `hasCredits(user, credit_type, cost)` then debit ledger  
4. Run domain service → persist history → return  

### 3.4 Entitlement feature keys (single source of truth)

| Feature key | Used by APIs | Owned via |
|---|---|---|
| `videoforge` | video-engine/* | OTO1, OTO9, OTO12 |
| `voice_studio` | voice-studio/* | OTO2, OTO9, OTO12 |
| `clickboost` | thumbnail-engine/*, clickbait-thumbnail/* | OTO3, OTO9, OTO12 |
| `rankpilot` | titles, optimize RankPilot routes | OTO4, OTO12 |
| `growthradar` | channel-engine, ideas, competitors, keywords | OTO5, OTO12 |
| `viralpredict` | predictor, ab-sim | OTO6, OTO12 |
| `watchtime` | retention | OTO7, OTO12 |
| `toolkit` | toolkit-engine/* | OTO8, OTO12 |
| `faceless_empire` | faceless pipeline + templates | OTO9, OTO12 |
| `moneyflow` | moneyflow/* | OTO10, OTO12 |
| `profit_accelerator` | profit/* | OTO11, OTO12 |
| `infinity` | everything + VIP flags | OTO12 |

### 3.5 API architecture (target)

```
app/api/
  entitlements/me/route.ts          GET owned products
  credits/balance/route.ts          GET balances
  webhooks/
    stripe/route.ts                 (exists — extend product grants)
    jvzoo/route.ts                  (new)
  videoforge/   → re-export or alias video-engine/*
  voicestudio/  → voice-studio/*
  clickboost/   → thumbnail + clickbait
  rankpilot/
    analyze-title/route.ts
    optimize-seo/route.ts
    upload-checklist/route.ts
  growthradar/  → channel + ideas + competitors + keywords
  viralpredict/
    predict/route.ts
    ab-sim/route.ts                 NEW
  watchtime/    → retention
  toolkit/      → toolkit-engine
  faceless/
    pipeline/route.ts               NEW guided multi-step
    templates/route.ts              NEW
  moneyflow/                        NEW
    roadmap/route.ts
    rpm-cpm/route.ts
    affiliates/route.ts
    sponsorship/route.ts
    adsense-checklist/route.ts
  profit/                           NEW
    revenue-plan/route.ts
    digital-product/route.ts
    roi/route.ts
    brand-deals/route.ts
```

Existing routes can stay; add **thin wrappers + entitlement middleware** so we don't rewrite every engine.

### 3.6 UI architecture (target sidebar groups)

```
CreatorOS AI
├── GrowthRadar          /growth  (or keep current routes, group in nav)
│   Channel Audit | Ideas | Competitors | Keywords
├── VideoForge           /video-engine
├── VoiceStudio          /voice-studio
├── ClickBoost           /thumbnail-engine | /clickbait-thumbnail
├── RankPilot            /rankpilot  (new primary)
├── ViralPredict         /predictor | /predictor/ab
├── WatchTime MAX        /retention
├── Toolkit X            /toolkit
├── Faceless Empire      /faceless   (new guided hub)
├── MoneyFlow            /moneyflow  (new)
├── Profit Accelerator   /profit     (new)
└── Account
    Credits | Purchases | Pricing | VIP (if Infinity)
```

### 3.7 Domain layer pattern (standard for every OTO)

Every product follows the existing pattern already used by coach/competitors/prediction:

```
domains/<product>/
  types.ts
  prompts/v1.ts
  rules.ts
  scoring.ts
  service.ts
  features.ts        # entitlement feature keys + credit costs
```

New products (MoneyFlow, Profit Accelerator, RankPilot polish, A/B sim, Faceless pipeline) **must** use this same shape for consistency.

### 3.8 Credit cost model (align with existing funnel math)

| Action | Credits | Credit type |
|---|---|---|
| Text gen (topic/hook/script/report) | 1 | text |
| Full kit (11 calls) | 8 | text |
| Thumbnail / clickbait image | 2 | image |
| 1,000 voice chars | 1 | voice_chars |
| AI video clip ~30s | 200 | video_clip |
| Slideshow/template video | 0–2 | text (script only) |

**Per-OTO lifetime grants (recommended starting point — tune before launch):**

| OTO | Price | Suggested grant |
|---|---|---|
| 1 VideoForge | $47 | 250 text |
| 2 VoiceStudio | $59 | 25k voice_chars + 100 text |
| 3 ClickBoost | $39 | 150 image |
| 4 RankPilot | $27 | 150 text |
| 5 GrowthRadar | $49 | 250 text |
| 6 ViralPredict | $37 | 200 text |
| 7 WatchTime | $29 | 150 text |
| 8 Toolkit | $39 | 200 text |
| 9 Faceless Empire | $79 | 300 text + 20k voice + 80 image + 4 video_clip |
| 10 MoneyFlow | $49 | 200 text |
| 11 Profit Accelerator | $69 | 250 text |
| 12 Infinity | $169 | sum of all + VIP flag + premium templates |

Keep worst-case COGS near **5–6% of sale price** (see old `OTO-FUNNEL-PLAN.md`).

### 3.9 Commerce architecture

```
JVZoo / WarriorPlus / Stripe Checkout
           │
           ▼
    Webhook adapter
           │
           ├─ grant entitlements (product_id)
           ├─ credit ledger +delta
           └─ mark purchase row

OTO12 Infinity:
  grant ALL product entitlements + vip=true

OTO9 Faceless Empire:
  grant videoforge + voice + clickboost + faceless_templates
  (either as bundle entitlement that expands, or 4 rows)
```

---

## 4. Gap analysis (build vs polish)

### 4.1 Must-build (blocking product completeness)

| ID | Work item | OTO |
|---|---|---|
| G1 | `entitlements` + `products` + purchase webhook grants | All |
| G2 | Unified `credits_ledger` + deduct on **all** AI routes | All |
| G3 | MoneyFlow domain + 5 tools UI/API | 10 |
| G4 | Profit Accelerator domain + 4 tools UI/API | 11 |
| G5 | RankPilot dedicated UX + upload checklist API | 4 |
| G6 | ViralPredict A/B Test Simulator | 6 |
| G7 | Faceless Empire hub (guided pipeline + templates) | 9 |
| G8 | Infinity entitlement expansion + VIP badge/features | 12 |

### 4.2 Should-build (quality / conversion)

| ID | Work item |
|---|---|
| S1 | Sidebar regroup by OTO brands |
| S2 | ClickBoost: template gallery + analyzer score UI |
| S3 | VoiceStudio: more voices/styles; download polish |
| S4 | VideoForge: explicit Long vs Shorts modes |
| S5 | WatchTime: better drop-off chart + actionable tips |
| S6 | GrowthRadar: real YouTube trends where possible |
| S7 | Credit balance widget in header |
| S8 | Paywall / upsell CTAs when entitlement missing |

### 4.3 Launch ops (non-code or hybrid)

| ID | Work item |
|---|---|
| L1 | Sales pages for OTO 1–12 |
| L2 | JVZoo product registration + OTO order |
| L3 | Premium / faceless template content packs |
| L4 | Wire real Replicate video model + cost test |
| L5 | Admin: grant/revoke product + credits |

---

## 5. Phase plan

### Phase 0 — Foundation freeze (Week 1) 🔴 CRITICAL

**Goal:** Stop unlimited API burn; make ownership real.

| Task | Detail | Done when |
|---|---|---|
| 0.1 Credit ledger schema | `credits_ledger` + balance views/RPCs | Migration applied |
| 0.2 Entitlements schema | `products`, `entitlements`, seed OTO 1–12 | Migration applied |
| 0.3 Gate all AI routes | Check entitlement + debit credits | No ungated OpenRouter/Replicate call |
| 0.4 Stripe webhook extend | Map price IDs → product + credits | Test purchase grants access |
| 0.5 Header credit UI | Show text/image/voice/video balances | Visible in dashboard shell |
| 0.6 Admin grant tool | Manual entitle + top-up | Admin can fix support cases |

**Exit criteria:** Buyer without OTO cannot call that engine; buyer with credits can; zero credits returns 402 with upgrade CTA.

---

### Phase 1 — Package existing engines as OTOs (Week 2)

**Goal:** Ship OTO 1, 2, 3, 5, 7, 8 as productized surfaces (mostly packaging).

| OTO | Work | Effort |
|---|---|---|
| **OTO1 VideoForge** | Brand nav entry; Long vs Shorts mode; ensure kit includes description+hashtags; history polish | S–M |
| **OTO2 VoiceStudio** | Expand voice list metadata; style tags; multi-lang filter; download UX | S |
| **OTO3 ClickBoost** | Unified ClickBoost landing inside app; link Thumbnail + Clickbait; basic templates | M |
| **OTO5 GrowthRadar** | Nav group for audit/ideas/competitors/keywords; single GrowthRadar home | S |
| **OTO7 WatchTime** | Retention page polish + tip cards | S |
| **OTO8 Toolkit X** | Assets/templates section on toolkit results; publishing checklist block | S–M |

**Exit criteria:** Each of these OTOs has a clear in-app home, entitlement lock, and working core flow.

---

### Phase 2 — Complete partial OTOs (Week 3)

**Goal:** Close RankPilot, ViralPredict, Faceless Empire.

| OTO | Work | Effort |
|---|---|---|
| **OTO4 RankPilot** | New `/rankpilot` page: title score, SEO rewrite, CTR tips, **pre-publish upload checklist** (title, desc, tags, thumb, schedule tip) | M |
| **OTO6 ViralPredict** | Keep predictor; add **A/B simulator**: 2 titles × 2 thumbs → predicted scores side-by-side | M |
| **OTO9 Faceless Empire** | New `/faceless` guided pipeline: niche → script → voice → thumb → export kit + faceless template pack (static JSON/MD assets first) | L |

**Exit criteria:** OTO 4/6/9 demoable end-to-end with entitlement gates.

---

### Phase 3 — Net-new money products (Week 4–5)

**Goal:** Build OTO 10 + 11 (highest product gap).

#### OTO10 MoneyFlow architecture

```
/moneyflow
  ├── Roadmap          → AI channel monetization plan (text)
  ├── RPM / CPM        → calculator + niche benchmarks (rules + light AI)
  ├── Affiliate Finder → niche → program ideas + pitch angle
  ├── Sponsorship Kit  → pitch email + rate card generator
  └── AdSense Checklist→ eligibility checklist (rules-based + tips)
```

Domain: `domains/moneyflow/*`  
Tables: `moneyflow_reports` (user_id, type, input, output, credits_used)

#### OTO11 Profit Accelerator architecture

```
/profit
  ├── Revenue Planner      → multi-stream plan (AdSense, affiliate, digital, brand)
  ├── Digital Product      → product ideas + outline + pricing suggestion
  ├── ROI Tracker          → manual entry + projected ROI
  └── Brand Deal Toolkit   → media kit blurb, outreach sequences, deal checklist
```

Domain: `domains/profit/*`  
Tables: `profit_plans`, `roi_entries`

**Exit criteria:** Full UI + API + history + credits for both products.

---

### Phase 4 — Infinity + commerce polish (Week 5–6)

| Task | Detail |
|---|---|
| 4.1 Infinity grant logic | One purchase → all entitlements + VIP |
| 4.2 VIP extras | Badge, priority flag on queue (if any), premium templates folder |
| 4.3 Pricing page rebuild | Show OTO 1–12 cards, owned state, upgrade paths |
| 4.4 JVZoo webhook | Mirror Stripe grant path |
| 4.5 Upsell CTAs | Soft locks with OTO-specific upgrade messages |
| 4.6 Video model | Confirm Replicate model + cost; document in env |

**Exit criteria:** Full funnel ownership works; Infinity buyer sees every nav item unlocked.

---

### Phase 5 — Hardening & launch (Week 6–7)

| Task | Detail |
|---|---|
| 5.1 Load / cost tests | Worst-case credit burn per OTO |
| 5.2 Rate limits | Per-user rate limit on expensive routes |
| 5.3 Error states | Empty credits, missing entitlement, API failures |
| 5.4 History consistency | Every engine saves history + credits_used |
| 5.5 Sales assets | OTO pages, screenshots, demo scripts |
| 5.6 Template content | Faceless + ClickBoost + Toolkit packs |
| 5.7 Monitoring | Log AI cost proxy (credits) vs purchases |

---

## 6. Recommended build order (dependency graph)

```
Phase 0 (Foundation)
    │
    ├─► Phase 1 (Package OTO 1,2,3,5,7,8)  ── parallelizable
    │
    ├─► Phase 2 (RankPilot, ViralPredict A/B, Faceless hub)
    │
    ├─► Phase 3 (MoneyFlow ∥ Profit Accelerator)
    │
    └─► Phase 4 (Infinity + webhooks + pricing)
            │
            └─► Phase 5 (Hardening + content + launch)
```

**Do not** build MoneyFlow/Profit before Phase 0 — otherwise you ship more ungated cost centers.

---

## 7. Per-OTO architecture cards (implementation-ready)

### OTO 1 — VideoForge PRO ($47)

| | |
|---|---|
| **Routes** | `/video-engine/*`, optional `/video-creation-pro` |
| **APIs** | topics, hooks, script, kit, session, (vcp generate) |
| **DB** | `video_engine_*`, credits text/video |
| **Entitlement** | `videoforge` |
| **Build left** | Long/Shorts UX split; description/hashtag guarantee; credit gate |

### OTO 2 — VoiceStudio AI ($59)

| | |
|---|---|
| **Routes** | `/voice-studio` |
| **APIs** | generate, history |
| **DB** | voice history + audio storage path |
| **Entitlement** | `voice_studio` |
| **Build left** | Premium/multi-lang catalog UX; styles; no clone unless new provider |

### OTO 3 — ClickBoost ($39)

| | |
|---|---|
| **Routes** | `/thumbnail-engine`, `/clickbait-thumbnail` |
| **APIs** | generate, enhance, history |
| **Entitlement** | `clickboost` |
| **Build left** | Unified brand page; templates; analyzer CTR suggestions panel |

### OTO 4 — RankPilot ($27)

| | |
|---|---|
| **Routes** | `/rankpilot` (new), reuse `/optimize` logic |
| **APIs** | analyze-title, optimize-seo, upload-checklist |
| **Entitlement** | `rankpilot` |
| **Build left** | Dedicated product + checklist end-to-end |

### OTO 5 — GrowthRadar ($49)

| | |
|---|---|
| **Routes** | `/dashboard`, `/ideas`, `/competitors`, `/keywords` |
| **APIs** | channel-engine, ideas, competitors, keywords |
| **Entitlement** | `growthradar` |
| **Build left** | Product home + optional live trends |

### OTO 6 — ViralPredict ($37)

| | |
|---|---|
| **Routes** | `/predictor`, `/predictor/ab` |
| **APIs** | predictor, ab-sim (new) |
| **Entitlement** | `viralpredict` |
| **Build left** | A/B simulator |

### OTO 7 — WatchTime MAX ($29)

| | |
|---|---|
| **Routes** | `/retention` |
| **APIs** | retention |
| **Entitlement** | `watchtime` |
| **Build left** | Drop-off viz + tip quality |

### OTO 8 — Creator Toolkit X ($39)

| | |
|---|---|
| **Routes** | `/toolkit` + history |
| **APIs** | toolkit generate/regenerate |
| **Entitlement** | `toolkit` |
| **Build left** | Assets + publishing toolkit section |

### OTO 9 — Faceless Empire ($79)

| | |
|---|---|
| **Routes** | `/faceless` hub + deep links to engines |
| **APIs** | pipeline orchestrator + templates |
| **Entitlement** | `faceless_empire` (implies child features) |
| **Build left** | Guided flow + template pack; optional slideshow later |

### OTO 10 — MoneyFlow ($49)

| | |
|---|---|
| **Routes** | `/moneyflow/*` |
| **APIs** | 5 new routes under moneyflow |
| **DB** | moneyflow_reports |
| **Entitlement** | `moneyflow` |
| **Build left** | **Everything** |

### OTO 11 — Profit Accelerator ($69)

| | |
|---|---|
| **Routes** | `/profit/*` |
| **APIs** | 4 new routes under profit |
| **DB** | profit_plans, roi_entries |
| **Entitlement** | `profit_accelerator` |
| **Build left** | **Everything** |

### OTO 12 — Infinity ($169)

| | |
|---|---|
| **Routes** | All + VIP UI |
| **Logic** | Grant all product_ids; `profiles.vip = true` |
| **Build left** | Grant expansion, pricing UX, premium template access |

---

## 8. Technical risks (carry forward)

1. **Ungated AI routes** → fixed only in Phase 0.  
2. **Placeholder video model** → validate before marketing AI video hard.  
3. **Lifetime credits** → need top-up product later (old plan’s Fuel Tank).  
4. **Two funnel docs** → use **this PDF map** for product naming; keep old doc for COGS math only.  
5. **plan_type vs entitlements** — migrate carefully; map elite/ultimate → Infinity-like access during transition.

---

## 9. Immediate next actions (this week)

1. ✅ Audit complete (this document)  
2. Implement Phase 0 schemas: `products`, `entitlements`, `credits_ledger`  
3. Add shared `requireEntitlement()` + `consumeCredits()` helpers in `lib/`  
4. Wire Video Engine first as reference implementation  
5. Then gate Thumbnail, Clickbait, Voice, Video Creation Pro  
6. Only after that: start Phase 1 packaging OR Phase 3 MoneyFlow if business prioritizes revenue OTOs  

---

## 10. Summary scorecard

| Area | Status |
|---|---|
| Core AI engines (video, voice, thumb, toolkit, growth, predict, retention) | **Mostly built** |
| OTO branding / entitlement packaging | **Not built** |
| Credit system (all engines) | **Partial (video only)** |
| MoneyFlow + Profit Accelerator | **Not built** |
| Faceless Empire as product | **Partial (tools only)** |
| Infinity | **Conceptual only** |
| Commerce (multi-product OTO) | **Stripe basic; multi-OTO incomplete** |

**Bottom line:**  
Aapke paas **CreatorOS ka engine layer ~70% ready** hai.  
Jo missing hai wo mainly:

1. **Commerce foundation** (entitlements + credits)  
2. **Product packaging** (OTO 1–9)  
3. **2 new money OTOs** (10–11)  
4. **Infinity + launch ops** (12)

Is sequence se pehle foundation, phir package, phir money tools, phir Infinity — yahi sabse safe aur fastest path launch tak hai.
