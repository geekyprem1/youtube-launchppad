# CreatorOS AI — OTO Build Tracker & Status

> **Source:** `CreatorOS_AI_Complete_OTO_Guide.pdf` + codebase  
> **Related:** `FE-OTO-ACCESS-PLAN.md`, `CREATOROS-ARCHITECTURE-AND-PHASE-PLAN.md`  
> **Last updated:** 2026-07-13  
> **Overall:** Product map **shipped** for FE + OTO 1–12. Remaining = ops (env links, deploy, smoke).

---

## Legend

| Status | Meaning |
|--------|---------|
| ✅ Done | Live / sellable |
| 🟡 Partial | Works; minor polish/env left |
| 🔴 Todo | Not built |
| ⬜ N/A | Ops / out of scope |

---

## Progress summary (all OTOs)

| OTO | Product | Price | Status | Main routes / unlock |
|-----|---------|------:|--------|----------------------|
| FE | YT Launchpad Core | $17 | ✅ | `plan_type=fe` · VideoForge core + basic thumb · 100 credits seed |
| 1 | VideoForge PRO | $47 | ✅ | `video_kit` · unlimited VE credits with oto1 |
| 2 | VoiceStudio AI | $59 | ✅ | `/voice-studio` · multi-lang + style filters |
| 3 | ClickBoost | $39 | ✅ | `/clickbait-thumbnail` · generate + templates + analyzer |
| 4 | RankPilot | $27 | ✅ | `/optimize` · upload checklist + title/thumb |
| 5 | GrowthRadar | $49 | ✅ | `/growth` hub · channel, ideas, competitors, keywords |
| 6 | ViralPredict | $37 | ✅ | `/predictor` · success predict + **A/B simulator** |
| 7 | WatchTime MAX | $29 | ✅ | `/retention` · curve viz + drop-off tips |
| 8 | Creator Toolkit X | $39 | ✅ | `/toolkit` · generate + assets + publish + templates |
| 9 | Faceless Empire | $79 | ✅ | `/faceless` · wizard + templates + slideshow plan · bundle unlocks |
| 10 | MoneyFlow | $49 | ✅ | `/moneyflow` · roadmap, RPM, affiliate, sponsorship, AdSense |
| 11 | Profit Accelerator | $69 | ✅ | `/profit` · revenue, digital product, ROI, brand deals |
| 12 | Infinity | $169 | ✅ | `oto12` all features · `/vip` lounge + premium templates |

---

## Phase A–F — Access system (done)

| Phase | What | Status |
|-------|------|--------|
| A | `fe` plan, `lib/features.ts`, `canAccess`, OTO catalog, env placeholders | ✅ |
| B | `unlocked_otos` migration SQL | ✅ files · run on Supabase if not already |
| C | Admin FE + OTO toggles, credit seed 100 on FE | ✅ |
| D | Sidebar locks, `/upgrade` LaunchPadJV page | ✅ |
| E | API `requireFeature` + client `FeatureGate` | ✅ |
| F | Smoke script, free UX, commit access layer | ✅ |

**Commerce model (locked):** LaunchPadJV external links only · **admin manual unlock** · no Stripe webhook auto-unlock.

---

## Major features built this session (recap)

### Access & admin
- [x] `plan_type`: free | fe | legacy tiers  
- [x] `unlocked_otos[]` (oto1–oto12)  
- [x] Admin UsersTable: FE plan + OTO checkboxes  
- [x] FE grant → `video_engine_credits >= 100`  
- [x] Sidebar lock icons → `/upgrade?feature=…`  
- [x] Upgrade page OTO grid (Buy / Owned / Link coming soon)  
- [x] Hard gates on locked APIs + pages  

### Credits UI (user-visible)
- [x] **Header** credit pill (always visible on dashboard pages)  
- [x] **Sidebar** credit badge  
- [x] Unlimited vs count (oto1/9/12 + high tiers)  
- [x] Low/empty credits → amber/red + link upgrade  
- [x] Plan name in header (no more hard-coded “Free Plan”)  
- [x] Focus refresh after generations  

### Products (by OTO)
- [x] **A/B Test Simulator** — `/api/predictor/ab`  
- [x] **RankPilot** upload checklist — `/api/rankpilot/checklist`  
- [x] **MoneyFlow** — 5 tools  
- [x] **Profit Accelerator** — 4 tools  
- [x] **Faceless Empire** wizard + 8 templates + slideshow plan  
- [x] **ClickBoost** templates + analyzer API  
- [x] **Toolkit X** assets library + publish checklist + content templates  
- [x] **Infinity VIP** `/vip` + premium pack + sidebar VIP badge  
- [x] **VideoForge** packaging + `lib/videoEngineAccess` (OTO1 unlimited)  
- [x] **VoiceStudio** language + style filters  
- [x] **GrowthRadar** hub `/growth`  
- [x] **WatchTime MAX** retention curve visualization  

---

## Key files (map)

| Area | Paths |
|------|--------|
| Access | `lib/features.ts`, `lib/oto-links.ts`, `lib/requireFeature.ts`, `lib/planLimits.ts`, `lib/plans.ts` |
| Credits burn | `lib/videoEngineAccess.ts` |
| Credits UI | `components/layout/CreditsBadge.tsx`, Header, Sidebar |
| Upgrade | `app/(dashboard)/upgrade/page.tsx` |
| Admin | `components/admin/UsersTable.tsx`, `app/api/admin/users/[id]/route.ts` |
| Migration | `supabase/migrations/20260713_unlocked_otos.sql` |
| RankPilot | `domains/rankpilot/*`, `/optimize` |
| ViralPredict A/B | `domains/prediction/*`, `/predictor` |
| MoneyFlow | `domains/moneyflow/*`, `/moneyflow` |
| Profit | `domains/profit/*`, `/profit` |
| Faceless | `domains/faceless/*`, `/faceless` |
| ClickBoost | `domains/clickbait-thumbnail/*` |
| Toolkit assets | `domains/toolkit-engine/assets.ts` |
| VIP | `domains/vip/*`, `/vip` |
| GrowthRadar | `/growth` |
| Smoke | `scripts/smoke-fe-oto-access.mjs` |

---

## Explicitly still open (ops / optional)

| Item | Status | Notes |
|------|--------|--------|
| Fill `NEXT_PUBLIC_FE_URL` + `OTO1`…`OTO12` in `.env` | 🟡 | Buy buttons stay “coming soon” until set |
| Confirm `unlocked_otos` column on production Supabase | 🟡 | Run migration if not done |
| Deploy / git push uncommitted work | 🟡 | Many files uncommitted locally after access commit |
| Real YouTube Trends API | ⬜ | Optional |
| Voice cloning | ⬜ | Out of scope (needs new provider) |
| Full auto video render (slideshow) | ⬜ | Plan/JSON handoff only; CapCut export |
| Stripe auto-unlock | ⬜ | Intentionally not used |

---

## How access works (quick)

```
Signup → plan_type = free (almost all locked)
Admin confirms FE payment → plan_type = fe (+ credits ≥ 100)
  → Video Engine core + Basic Thumbnail open
User buys OTO on LaunchPadJV → Admin ticks unlocked_otos
  → Feature opens for that user
oto12 / elite / creator_pro / ultimate → full access
role = admin → always full access
```

**Credits:** Lifetime `video_engine_credits` for topics/hooks/script/kit.  
**Unlimited (no burn):** pro+, or unlocked `oto1` / `oto9` / `oto12`.

---

## Changelog

| Date | What |
|------|------|
| 2026-07-13 | Tracker created from PDF + audit |
| 2026-07-13 | Access A–F: FE, OTOs, sidebar, upgrade, admin, API gates |
| 2026-07-13 | OTO6 A/B Simulator |
| 2026-07-13 | OTO4 RankPilot checklist |
| 2026-07-13 | OTO10 MoneyFlow (5 tools) |
| 2026-07-13 | OTO11 Profit Accelerator (4 tools) |
| 2026-07-13 | OTO9 Faceless pipeline + templates + slideshow plan |
| 2026-07-13 | OTO3 ClickBoost templates + analyzer |
| 2026-07-13 | OTO8 Toolkit assets + publish + templates |
| 2026-07-13 | OTO12 VIP lounge + premium templates + badge |
| 2026-07-13 | Polish: VideoForge credits rules, Voice styles, GrowthRadar hub, WatchTime curve |
| 2026-07-13 | **User-facing credits UI** (Header + Sidebar) |
| 2026-07-13 | Full status refresh of this document |

---

## Smoke checklist (before go-live)

1. [ ] free → almost all locked; credits may show low/default  
2. [ ] Admin sets **fe** → VE + thumb open; credits ≥ 100  
3. [ ] Header/Sidebar show correct **credits** or **Unlimited**  
4. [ ] Lock → `/upgrade`; Buy opens external URL if env set  
5. [ ] Admin oto2 → Voice; oto3 → ClickBoost; … each OTO  
6. [ ] Admin oto12 → all open + VIP badge + `/vip`  
7. [ ] Admin role → full bypass  
8. [ ] FE user Voice API → 403; topics API → 200 (if credits)  

---

**End of status.**  
File: `CREATOROS-OTO-BUILD-TRACKER.md` · Keep updating changelog when shipping.
