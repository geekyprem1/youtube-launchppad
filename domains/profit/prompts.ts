import type { ProfitRequest } from "./types";

export function buildProfitPrompt(
  req: ProfitRequest,
  extra?: Record<string, unknown>
): string {
  const base = `Niche: ${req.niche}
Subs: ${req.subs}
Monthly views: ${req.monthly_views}
Country: ${req.country}
Current AdSense ~/mo: $${req.monthly_adsense_usd}`;

  if (req.tool === "revenue_planner") {
    return `You are CreatorOS Profit Accelerator — revenue systems coach (beyond AdSense).

${base}
Hours/week available: ${req.hours_per_week}
Target monthly income: $${req.target_monthly_usd}
Current streams: ${req.current_streams || "(mostly ads or none)"}
Suggested split context: ${JSON.stringify(extra || {})}

Build a realistic multi-stream revenue plan. No fake guarantees — use ranges.

Return ONLY JSON:
{
  "summary": "2 sentences",
  "target_months": 3-12,
  "streams": [
    {
      "name": "AdSense|Digital product|Affiliate|Brand deals|Services|Community",
      "monthly_target_usd": "range or number as string",
      "why": "...",
      "first_actions": ["...", "..."],
      "effort": "low|medium|high"
    }
  ],
  "weekly_schedule": [
    { "block": "Mon-Wed", "focus": "...", "hours": 0 }
  ],
  "milestones": [
    { "month": 1, "goal": "...", "metric": "..." }
  ],
  "avoid": ["mistake to avoid"]
}`;
  }

  if (req.tool === "digital_product") {
    return `You are CreatorOS Profit Accelerator — digital product strategist for YouTubers.

${base}
Skills / expertise: ${req.skills || "(infer from niche)"}
Audience pain: ${req.audience_pain || "(infer)"}
Price preference: ${req.price_preference}

Propose sellable digital products that fit this audience. Be practical.

Return ONLY JSON:
{
  "summary": "...",
  "products": [
    {
      "name": "...",
      "format": "ebook|template pack|mini-course|Notion kit|prompt pack|membership",
      "price_usd": "range",
      "promise": "outcome for buyer",
      "outline": ["module/section 1", "..."],
      "validation_steps": ["...", "..."],
      "launch_plan": ["week 1", "week 2"]
    }
  ],
  "funnel": ["YouTube video → ..."],
  "upsells": ["..."],
  "warnings": ["don't overbuild before validation"]
}`;
  }

  if (req.tool === "roi_tracker") {
    return `You are CreatorOS Profit Accelerator — ROI analyst for creator businesses.

${base}
Computed metrics: ${JSON.stringify(extra || {})}
Free-text investments notes: ${"investments" in req ? req.investments : ""}

Interpret the numbers and coach better spend. Be blunt but constructive.

Return ONLY JSON:
{
  "summary": "...",
  "health": "strong|ok|weak|bleeding",
  "insights": ["...", "..."],
  "cut_or_keep": [
    { "item": "tools/ads/freelance", "action": "cut|keep|increase", "why": "..." }
  ],
  "improve_roi_actions": ["...", "..."],
  "target_next_month": {
    "max_tool_spend_usd": 0,
    "revenue_focus": "..."
  }
}`;
  }

  // brand_deals
  return `You are CreatorOS Profit Accelerator — brand deal toolkit for mid/long-term creator income.

${base}
Avg views: ${"avg_views" in req ? req.avg_views : 0}
Engagement %: ${"engagement_rate_pct" in req ? req.engagement_rate_pct : 0}
Past deals: ${"past_deals" in req ? req.past_deals || "(none)" : "(none)"}
Preferred categories: ${"brand_categories" in req ? req.brand_categories || "(open)" : "(open)"}
Rate context: ${JSON.stringify(extra || {})}

Build a brand-deal operating kit (not just one email).

Return ONLY JSON:
{
  "summary": "...",
  "positioning": "one-liner for media kit",
  "ideal_brands": ["type 1", "type 2"],
  "packages": [
    {
      "name": "Starter|Growth|Flagship",
      "includes": ["..."],
      "price_range_usd": "...",
      "best_for": "..."
    }
  ],
  "outreach_sequence": [
    { "day": 0, "channel": "email|linkedin|form", "message_angle": "..." }
  ],
  "contract_checklist": ["usage rights", "payment terms", "..."],
  "red_flags": ["walk away if..."],
  "sample_pitch": "short pitch paragraph"
}`;
}
