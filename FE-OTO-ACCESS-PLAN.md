# CreatorOS AI — FE Access + OTO Locks + Manual Admin Upgrade Plan

> **Status:** Approved · Ready to build  
> **Start:** Kal se  
> **Source:** Plan mode approval (2026-07-12) + FE screenshot + LaunchPadJV payment model  
> **Related docs:** `CREATOROS-ARCHITECTURE-AND-PHASE-PLAN.md`, `OTO-DETAILED-BREAKDOWN.md`, CreatorOS PDF

---

## 1. Context (kyun ye plan)

| Rule | Decision |
|---|---|
| Payment gateway (Stripe/in-app) | **Nahi use karna** |
| Payment | **LaunchPadJV external links** only |
| User journey | Pehle **FE** kharide → dashboard aaye |
| FE plan | Default paid base plan |
| Baaki tools | **Locked** jab tak OTO na kharide |
| OTO buy | Dashboard me **Upgrade page** → LaunchPadJV link |
| Unlock after payment | **Admin manually** user pe OTO/plan set kare |

**No webhook. No auto-unlock. No in-app checkout.**

---

## 2. FE me kya active (screenshot se)

**FrontEnd (FE) — YT Launchpad Core — $17**

Pain point: *“Mujhe pata hi nahi next kya post karun.”*

| Included | Detail |
|---|---|
| **Video Engine (core)** | Topic ideas, hooks, scripts generate |
| **Basic Thumbnail Engine** | Simple thumbnail banana |
| **100 lifetime credits** | ≈ 100 text gens / mix (wire later if needed) |
| **Daily usage cap ON** | Unlimited nahi — OTO se hatega later |

**FE pe LOCKED (examples):**

- Channel Engine / audits  
- Voice Studio  
- Recommendation Engine  
- Toolkit Engine  
- Clickbait Thumbnail  
- Video Creation Pro  
- Success Predictor  
- Title & Thumbnail optimize (RankPilot)  
- Retention Analyzer  
- Competitors  
- Keywords  
- Full Kit (11-step) — lock (core script path open)  
- MoneyFlow / Profit / Faceless hub (jab banenge)

---

## 3. User flow

```
1. User LaunchPadJV pe FE kharidta hai (app ke bahar)
2. User signup / login (app)
3. Admin dekhta hai payment → plan_type = fe (+ credits 100)
4. Dashboard: sirf Video Engine + Basic Thumbnail open
5. Baaki nav = Lock → click → /upgrade
6. User OTO card pe Buy → LaunchPadJV link (new tab)
7. Admin payment confirm karke unlocked_otos me OTO add karta hai
8. Us user ke liye wo tool open
```

```
Signup → plan_type = free (almost sab lock)
              ↓
Admin → plan_type = fe
              ↓
Video Engine + Basic Thumbnail OPEN
              ↓
/upgrade → external OTO links
              ↓
Admin → unlocked_otos[] toggle
              ↓
Feature unlock
```

---

## 4. Data model

### profiles (extend)

| Field | Type | Use |
|---|---|---|
| `plan_type` | text | `free` \| `fe` \| (legacy: starter/pro/…) |
| `unlocked_otos` | text[] | e.g. `{'oto2','oto3'}` |
| `video_engine_credits` | int | Already exists; FE seed **100** jab admin FE set kare |

```sql
-- Migration (run in Supabase)
alter table public.profiles
  add column if not exists unlocked_otos text[] not null default '{}';

-- plan_type values used going forward:
-- 'free'  = no FE yet
-- 'fe'    = FE buyer (default paid)
-- keep old plan keys for legacy users if needed
```

### Access rule

```
canAccess(feature) =
  plan is ultimate/elite/creator_pro with "all"
  OR feature is in FE_FEATURES when plan_type === 'fe' (or higher base)
  OR feature is unlocked via any id in unlocked_otos
  OR user.role === 'admin'
```

---

## 5. Feature keys (modules)

| featureKey | Routes | FE? | Unlock OTO (CreatorOS) |
|---|---|---|---|
| `video_engine` | `/video-engine` (topics/hooks/script) | **YES** | — |
| `video_engine_history` | `/video-engine/history` | **YES** | — |
| `thumbnail_basic` | `/thumbnail-engine` | **YES** | — |
| `thumbnail_history` | `/thumbnail-engine/history` | **YES** | — |
| `video_kit` | `/video-engine/kit` | NO | OTO1 VideoForge (upsell) |
| `channel_engine` | `/dashboard` | NO | OTO5 GrowthRadar |
| `ideas` | `/ideas` | NO | OTO5 GrowthRadar |
| `competitors` | `/competitors` | NO | OTO5 GrowthRadar |
| `keywords` | `/keywords` | NO | OTO5 GrowthRadar |
| `voice_studio` | `/voice-studio` | NO | OTO2 VoiceStudio |
| `toolkit` | `/toolkit` | NO | OTO8 Toolkit X |
| `clickbait` | `/clickbait-thumbnail` | NO | OTO3 ClickBoost |
| `video_creation_pro` | `/video-creation-pro` | NO | OTO9 Faceless / OTO1 bundle |
| `predictor` | `/predictor` | NO | OTO6 ViralPredict |
| `optimize` | `/optimize` | NO | OTO4 RankPilot |
| `retention` | `/retention` | NO | OTO7 WatchTime MAX |

---

## 6. OTO catalog (upgrade page list)

LaunchPadJV links env se aayenge — abhi placeholder.

| ID | Product | Price | Unlocks (featureKeys) | Env link |
|---|---|---|---|---|
| oto1 | VideoForge PRO | $47 | video_kit, (optional more VE) | `NEXT_PUBLIC_OTO1_URL` |
| oto2 | VoiceStudio AI | $59 | voice_studio | `NEXT_PUBLIC_OTO2_URL` |
| oto3 | ClickBoost | $39 | clickbait, thumbnail extras | `NEXT_PUBLIC_OTO3_URL` |
| oto4 | RankPilot | $27 | optimize | `NEXT_PUBLIC_OTO4_URL` |
| oto5 | GrowthRadar | $49 | channel_engine, ideas, competitors, keywords | `NEXT_PUBLIC_OTO5_URL` |
| oto6 | ViralPredict | $37 | predictor | `NEXT_PUBLIC_OTO6_URL` |
| oto7 | WatchTime MAX | $29 | retention | `NEXT_PUBLIC_OTO7_URL` |
| oto8 | Creator Toolkit X | $39 | toolkit | `NEXT_PUBLIC_OTO8_URL` |
| oto9 | Faceless Empire | $79 | video_creation_pro + bundle of voice/thumb/script | `NEXT_PUBLIC_OTO9_URL` |
| oto10 | MoneyFlow | $49 | moneyflow (future) | `NEXT_PUBLIC_OTO10_URL` |
| oto11 | Profit Accelerator | $69 | profit (future) | `NEXT_PUBLIC_OTO11_URL` |
| oto12 | Infinity | $169 | **all features** | `NEXT_PUBLIC_OTO12_URL` |

Optional: `NEXT_PUBLIC_FE_URL` for FE buy link (login/pricing soft CTA).

---

## 7. Build phases (kal se order)

### Phase A — Config foundation (Day 1 morning)

**Goal:** Code me FE + OTO rules ek jagah.

| Task | Files |
|---|---|
| A1. Add `fe` to `PlanType` + PLANS | `lib/plans.ts` |
| A2. Create feature registry + OTO catalog | `lib/features.ts` **(new)** |
| A3. LaunchPadJV URL helpers | `lib/oto-links.ts` **(new)** or inside features |
| A4. `canAccess(plan, unlocked_otos, featureKey)` | `lib/features.ts` or `lib/planLimits.ts` |
| A5. Env placeholders | `.env.local.example` |

**Done when:** Import karke `canAccess('fe', [], 'video_engine') === true` aur `canAccess('fe', [], 'voice_studio') === false`.

---

### Phase B — Database (Day 1)

| Task | Detail |
|---|---|
| B1. Migration SQL | `unlocked_otos text[] default '{}'` |
| B2. File | `supabase/migrations/..._unlocked_otos.sql` + note in README/schema |
| B3. Supabase pe run | Manually SQL editor |

**Done when:** profiles me column dikhe; select me array aaye.

---

### Phase C — Admin manual upgrade (Day 1–2)

| Task | Files |
|---|---|
| C1. PATCH accept `unlocked_otos` | `app/api/admin/users/[id]/route.ts` |
| C2. Jab `plan_type` → `fe`: agar credits &lt; 100 to set 100 | same route |
| C3. UsersTable: Plan dropdown me **FE** | `components/admin/UsersTable.tsx` |
| C4. UsersTable: OTO checkboxes / multi-select | same |
| C5. GET already `select *` — unlocked_otos auto aayega | `app/api/admin/users/route.ts` |

**Done when:** Admin FE set kare + oto2 tick kare → DB update; refresh pe state rahe.

---

### Phase D — Sidebar locks + Upgrade page (Day 2)

| Task | Files |
|---|---|
| D1. Nav items pe `featureKey` | `components/layout/Sidebar.tsx` |
| D2. Fetch `plan_type` + `unlocked_otos` | Sidebar useEffect |
| D3. Locked = Lock icon, muted, link to `/upgrade?feature=...` | Sidebar |
| D4. Bottom CTA “Upgrade OTOs” → `/upgrade` | Sidebar (free/fe users) |
| D5. New page OTO grid | `app/(dashboard)/upgrade/page.tsx` **(new)** |
| D6. Card: name, price, features, Owned badge, Buy (external link) | upgrade page |
| D7. Missing link = “Link coming soon” disabled button | upgrade page |

**Done when:** FE user sirf VE + thumb open dekhe; lock click se upgrade page; Buy naya tab.

---

### Phase E — Hard gates (API + pages) (Day 2–3)

| Task | Detail |
|---|---|
| E1. Server helper | `requireFeature(userId, featureKey)` → 403 JSON |
| E2. Gate non-FE APIs | voice, toolkit, clickbait, vcp, predictor, ideas, competitors, keywords, retention, channel-engine, titles/optimize as needed |
| E3. FE APIs open | video-engine topics/hooks/script (+ session); thumbnail-engine generate |
| E4. Kit API | require `video_kit` or oto1 |
| E5. Locked page optional | client banner “Upgrade to unlock” if direct URL |

**Done when:** FE user Voice Studio API call kare → 403; topics API → 200 (credits allow).

---

### Phase F — Polish + smoke test (Day 3)

| Task | Detail |
|---|---|
| F1. Free user UX | Almost all lock; message FE purchase / contact |
| F2. Infinity oto12 | Admin grants oto12 → all features true |
| F3. Admin always full access | role=admin bypass locks |
| F4. Smoke checklist | Section 9 below |
| F5. Commit | Push when stable |

---

## 8. Critical files checklist

| File | Action |
|---|---|
| `lib/plans.ts` | Add `fe` |
| `lib/features.ts` | **NEW** — keys, catalog, canAccess |
| `lib/oto-links.ts` | **NEW** (optional) — URL resolve |
| `lib/planLimits.ts` | Extend helpers |
| `supabase/migrations/*_unlocked_otos.sql` | **NEW** |
| `components/layout/Sidebar.tsx` | Locks + upgrade CTA |
| `app/(dashboard)/upgrade/page.tsx` | **NEW** OTO list |
| `components/admin/UsersTable.tsx` | FE + OTO toggles |
| `app/api/admin/users/[id]/route.ts` | unlocked_otos + credit seed |
| API routes (locked engines) | requireFeature |
| `.env.local.example` | OTO1–12 URLs, FE URL |

---

## 9. Verification (smoke test)

1. **free** user → almost everything locked; VE/thumb also locked (or soft CTA)  
2. Admin sets **fe** → Video Engine + Basic Thumbnail work  
3. Voice / Toolkit / Clickbait etc. still locked  
4. Lock click → `/upgrade`  
5. Buy button → external LaunchPadJV URL (placeholder ok)  
6. Admin ticks **oto2** → Voice Studio opens for that user only  
7. Other users unchanged  
8. Admin role → full sidebar open  
9. FE set → credits at least 100  

---

## 10. Explicitly OUT OF SCOPE (is phase me nahi)

- Stripe / LaunchPadJV webhook auto-unlock  
- Naye products build (MoneyFlow UI, Profit UI, A/B sim, etc.)  
- Full unified credit ledger sab engines pe  
- Poora CreatorOS rebrand har page pe  
- Payment gateway integration  

Ye baad me `CREATOROS-ARCHITECTURE-AND-PHASE-PLAN.md` se.

---

## 11. Env template (copy later)

```env
# LaunchPadJV / external payment links (no gateway in app)
NEXT_PUBLIC_FE_URL=https://your-launchpadjv-fe-link
NEXT_PUBLIC_OTO1_URL=
NEXT_PUBLIC_OTO2_URL=
NEXT_PUBLIC_OTO3_URL=
NEXT_PUBLIC_OTO4_URL=
NEXT_PUBLIC_OTO5_URL=
NEXT_PUBLIC_OTO6_URL=
NEXT_PUBLIC_OTO7_URL=
NEXT_PUBLIC_OTO8_URL=
NEXT_PUBLIC_OTO9_URL=
NEXT_PUBLIC_OTO10_URL=
NEXT_PUBLIC_OTO11_URL=
NEXT_PUBLIC_OTO12_URL=
```

---

## 12. Kal subah pehli 3 cheezein (quick start)

1. `lib/plans.ts` me **`fe`** plan add karo  
2. `lib/features.ts` banao (FE_FEATURES + OTO_CATALOG + canAccess)  
3. Supabase me `unlocked_otos` column migration run karo  

Phir Admin UI → Sidebar → `/upgrade` → API gates.

---

## 13. Notes / decisions locked

| Topic | Decision |
|---|---|
| Commerce | External links only |
| Unlock | Admin manual only |
| FE content | Video Engine core + Basic Thumbnail only |
| Default after FE grant | `plan_type = 'fe'` |
| Signup default | `free` until admin confirms FE payment |
| Kit on FE | Locked (OTO1) |
| Infinity | oto12 in unlocked_otos = all features |

---

**End of plan.**  
File: `FE-OTO-ACCESS-PLAN.md` · Project root · Ready for build tomorrow.
