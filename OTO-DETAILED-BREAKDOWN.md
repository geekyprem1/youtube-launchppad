# YT Launchpad — OTO 1 se 14 ka Detailed Breakdown

> Source: `OTO-FUNNEL-PLAN.md` (Prepared 2026-07-03)
> Ceiling $170 · Commission 50% · Har offer me lifetime credits × $0.01 ≈ sale price ka 5–6% (worst case)
> **Credit meaning:** 1 credit = $0.01 worth of AI usage. Text gen = 1 credit, Kit bundle = 8 credits, 1 image = 2 credits, 1000 voice chars = 1 credit, 1 AI video clip (30s) = 200 credits.
>
> ⚠️ Sabhi credits **lifetime pool** hain (monthly refill nahi). Khatam hone par paid top-up (OTO14) lena hoga.

---

## FrontEnd (FE) — YT Launchpad Core — $17

**Pain point:** "Mujhe pata hi nahi next kya post karun."

**Kya milega:**
- **Video Engine** ka core access — topic ideas, hooks aur scripts generate karna
- **Basic Thumbnail Engine** — simple thumbnail banane ki suvidha
- **100 lifetime credits** (≈ 100 text generations, ya mix)
- Daily usage cap **lagu rahega** (unlimited nahi) — wahi OTO1 me hatega

**Worst-case COGS:** $1.00 (sale ka 5.9%)
**Kis ke liye:** Naya creator jo bas start karna chahta hai, kam budget me.

---

## OTO1 — Unlimited TURBO — $37

**Pain point:** "Hafte me ek video kaafi nahi hai."

**Kya milega (FE ke upar):**
- **Daily cap poora hat jaata hai** — ab jitna chahe generate karo (credits tak)
- **Full 11-step "Kit" bundle** unlock — ek hi click me pura content kit (topic + hook + script + description + tags + etc. — 11 alag generations ek saath)
- **Clickbait Thumbnail tool** ka access
- **200 lifetime credits**

**Worst-case COGS:** $2.00 (5.4%)
**Kis ke liye:** Jo consistently, roz/regular content banana chahta hai.

---

## OTO2 — Unlimited THUNDERBOLT — $67

**Pain point:** "Main apni awaaz record nahi kar sakta / karna nahi chahta."

**Kya milega (OTO1 ke upar):**
- **Voice Studio voiceovers** unlock — AI se voiceover generate karo (kokoro-82m model, fixed voices)
- **Priority queue** — tumhari requests pehle process hongi
- **350 lifetime credits**, jisme **15,000 voice characters** shamil hain

**Worst-case COGS:** $3.50 (5.2%)
**Kis ke liye:** Faceless / voice-shy creator jo AI voiceover chahta hai.

---

## OTO3 — DFY Content Pack (Silver) — $27

**Pain point:** "Mujhe raw AI output par bharosa nahi."

**Kya milega:**
- **100 Done-For-You (ready-made) scripts, hooks aur thumbnail templates** — static, pehle se banaye hue, curated
- Koi AI generation nahi — direct copy-paste / use karo
- **0 credits** (static content, koi per-use AI cost nahi)

**Worst-case COGS:** ~$0 (sabse safe revenue — koi AI API cost nahi)
**Kis ke liye:** Jise proven, ready-made templates chahiye bina AI ke bharose ke.

---

## OTO4 — DFY Content Pack (Gold) — $47

**Pain point:** "Mujhe apne niche ke liye deeper coverage chahiye."

**Kya milega (Silver se upgrade):**
- **300 niche-specific packs** (Silver ke 100 se zyada aur deeper)
- **Monthly trend refresh** — har mahine naye trending templates add honge
- **0 credits** (static + refresh process)

**Worst-case COGS:** <$0.10/mahina
**Kis ke liye:** Serious creator jo apne niche me deeply cover hona chahta hai + fresh trends chahta hai.

---

## OTO5 — Traffic & Virality Booster — $37

**Pain point:** "Mere videos par click hi nahi aate."

**Kya milega:**
- **Trending topic finder** — abhi kya trend kar raha hai wo dhundho
- **AI Title CTR scorer** — title daalo, AI batayega kitna click-worthy hai (score deta hai)
- **200 lifetime credits**

**Worst-case COGS:** $2.00 (5.4%)
**⚠️ Build note:** Ise sach me kaam karne ke liye **real trending-data source** (YouTube Data API / Google Trends) chahiye — warna "trending" sirf AI ka guess hoga.
**Kis ke liye:** Jiske videos me views/CTR ki problem hai.

---

## OTO6 — Clickbait Thumbnail Pro — $47

**Pain point:** "Mere thumbnails homemade lagte hain."

**Kya milega:**
- **Standalone Clickbait Thumbnail tool** (full pro version)
- **Har request par 2 A/B variants** — do options milenge, jise chahe use karo/test karo
- **250 image credits** (≈ 125 requests kyunki 2 variants each)

**Worst-case COGS:** $2.50 (5.3%)
**Kis ke liye:** Jise professional, high-CTR thumbnails chahiye + A/B testing.

---

## OTO7 — Voice Studio Pro — $67

**Pain point:** "Mujhe apni awaaz pasand nahi" / multi-language chahiye.

**Kya milega (Voice Studio se upgrade):**
- **Expanded voice library** — bahut zyada voice options
- **5 custom voice clones** (lifetime)
- **350 credits (35,000 characters)**

**Worst-case COGS:** $3.50 (5.2%)
**⚠️ Build note:** Voice **cloning abhi exist nahi karta** — kokoro-82m cloning support nahi karta. Decision lena hai: ya to ElevenLabs-class cloning provider integrate karo, ya "clone" claim hata ke sirf extra preset voices becho.
**Kis ke liye:** Jise premium/multi-language/custom voice chahiye.

---

## OTO8 — Video Creation Pro — $97

**Pain point:** "Main edit nahi karna chahta / face nahi dikhana chahta."

**Kya milega:**
- **Unlimited template/slideshow videos** — stock footage + Ken Burns pan + existing TTS + captions se bane videos (near-zero cost, isliye "unlimited")
- **4 true AI-generated video clips (lifetime)** — real AI video (Replicate, Wan-class model)
- **500 credits + 4 video allotment**

**Worst-case COGS:** $5.80 (~6%)
**⚠️ Marketing note:** "Unlimited AI video" **mat** becho — ek real clip $1.20–$2.40 ka padta hai. Isliye split kiya: bulk = unlimited slideshow video (sasta), plus chhota AI-clip allotment, plus paid top-ups.
**⚠️ Build note:** (1) real AI-video model wire karna hai, (2) slideshow engine **zero se banana hai** (Pexels/Pixabay + pan + captions + TTS) — abhi codebase me nahi hai.
**Kis ke liye:** Faceless creator jo editing nahi karna chahta.

---

## OTO9 — Channel Monetization Toolkit — $37

**Pain point:** "Mujhe pata nahi is se paise kaise banau."

**Kya milega:**
- **Strategy reports** — channel ko monetize karne ki strategy
- **Sponsorship pitch generator** — brands ko bhejne ke liye ready pitch
- **Rate-card generator** — apne rates ka professional card
- **200 lifetime credits**

**Worst-case COGS:** $2.00 (5.4%)
**Kis ke liye:** Jo channel se income banana chahta hai (sponsorships/deals).

---

## OTO10 — Viral Success Masterclass — $47

**Pain point:** "Tool samajh aata hai, strategy nahi."

**Kya milega:**
- **Video training course** — viral hone ki full strategy
- **PDF playbooks** — step-by-step guides
- Pure content — **0 credits**

**Worst-case COGS:** ~$0 (koi AI cost nahi)
**Kis ke liye:** Jise tool ke saath strategy/knowledge bhi chahiye.

---

## OTO11 — Multi-Channel / Global License — $67

**Pain point:** "Main ek se zyada channel chalata hoon."

**Kya milega:**
- **5 additional channels/brands** par use karne ki license
- **350 lifetime credits**

**Worst-case COGS:** $3.50 (5.2%)
**⚠️ Build note:** Check karna hai ki app **multiple channels/workspaces per user** support karta hai — agar nahi, to ye concept add karna padega.
**Kis ke liye:** Multi-channel creator / chhota network.

---

## OTO12 — Agency & Client License — $127

**Pain point:** "Main ise ek service ke roop me bechna chahta hoon."

**Kya milega:**
- **Up to 10 client channels** ke liye content generate karo
- **White-labeled client reports** — apne clients ko branded reports do
- **700 lifetime credits**

**Worst-case COGS:** $7.00 (5.5%)
**⚠️ Build note:** Client management (mini-CRM for client channels) + white-labeled PDF export banana hai — medium feature.
**Kis ke liye:** Agency owner / freelancer jo clients ko serve karta hai.

---

## OTO13 — Whitelabel + Reseller Rights — $167

**Pain point:** "Main yahi software apne naam se bechna chahta hoon."

**Kya milega:**
- **Poora software rebrand** karo (apna logo/naam)
- **100% resale revenue** apne pass rakho
- **900 lifetime credits**

**Worst-case COGS:** $9.00 (5.4%)
**⚠️ Build note:** **Sabse bada build** — rebrand system (logo/naam swap) + resellers ke apne customers ko bechne ka tarika. Ya to multi-tenant white-label (per-reseller custom domain/logo), ya per-buyer separate deployable instance. Ye decision sabse pehle lena hai.
**Kis ke liye:** Entrepreneur jo apni SaaS brand launch karna chahta hai.

---

## OTO14 — Monthly "Fuel Tank" Top-Up — $27–47/mahina *(Recurring)*

> Ye original plan ke §4 ("Beyond the 14") se hai — recurring revenue engine. Yahi funnel ka asli long-term profit source hai.

**Pain point:** "Mere lifetime credits khatam ho gaye."

**Kya milega:**
- **Har mahine credits ka refill** — sabhi upar wale offers lifetime pool hain, to buyer eventually khatam karega; wahi upsell moment hai (support ticket nahi)
- Recurring subscription — **ongoing monthly profit** deta hai jo one-time funnel me missing hai

**Kyun zaruri:** One-time funnel se ek baar hi paisa aata hai; ye har mahine income deta hai. **Plan me clearly "do this one" likha hai.**
**Kis ke liye:** Har active user jiske credits khatam hote hain.

---

## Quick Summary Table

| # | Offer | Price | Credits | COGS | Type |
|---|---|---|---|---|---|
| FE | YT Launchpad Core | $17 | 100 | $1.00 | Software |
| OTO1 | Unlimited TURBO | $37 | 200 | $2.00 | Software |
| OTO2 | Unlimited THUNDERBOLT | $67 | 350 (15k voice) | $3.50 | Software |
| OTO3 | DFY Silver | $27 | 0 | ~$0 | Content |
| OTO4 | DFY Gold | $47 | 0 | <$0.10/mo | Content |
| OTO5 | Traffic & Virality Booster | $37 | 200 | $2.00 | Software |
| OTO6 | Clickbait Thumbnail Pro | $47 | 250 img | $2.50 | Software |
| OTO7 | Voice Studio Pro | $67 | 350 (35k chars) | $3.50 | Software |
| OTO8 | Video Creation Pro | $97 | 500 + 4 video | $5.80 | Software |
| OTO9 | Channel Monetization Toolkit | $37 | 200 | $2.00 | Software |
| OTO10 | Viral Success Masterclass | $47 | 0 | ~$0 | Content |
| OTO11 | Multi-Channel License | $67 | 350 | $3.50 | License |
| OTO12 | Agency & Client License | $127 | 700 | $7.00 | License |
| OTO13 | Whitelabel + Reseller | $167 | 900 | $9.00 | License |
| OTO14 | Monthly Fuel Tank Top-Up | $27–47/mo | Monthly refill | — | Recurring |

---

## ⚠️ Bechne se pehle 3 critical fixes (plan §0)

1. **Credit enforcement 4 engines par nahi hai** — Thumbnail Engine, Clickbait Thumbnail, Voice Studio, Video Creation Pro sirf `if (!user)` check karte hain, koi usage cap nahi. Sirf Video Engine credits deduct karta hai. Bina cap ke launch = unlimited real API cost bina revenue ke.
2. **Video model wire nahi hai** — `REPLICATE_VIDEO_MODEL` abhi bhi placeholder `owner/model-name` hai. OTO8 price karne se pehle real model pick + cost-test karo.
3. **Lifetime pools, monthly refill nahi** — one-time fee se lifetime free refill = uncapped liability. Har allotment lifetime pool hai + paid top-up (OTO14) path zaruri.
