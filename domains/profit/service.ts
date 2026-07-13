import { callAI } from "@/lib/openrouter";
import { safeJsonParse } from "@/lib/utils";
import { computeRoi, suggestStreamSplit } from "./roi-math";
import { buildProfitPrompt } from "./prompts";
import type { ProfitRequest } from "./types";

export async function processProfit(req: ProfitRequest) {
  if (req.tool === "revenue_planner") {
    const split = suggestStreamSplit(
      req.target_monthly_usd || 1000,
      (req.monthly_adsense_usd || 0) > 0 || req.subs >= 1000
    );
    const metrics = {
      target_monthly_usd: req.target_monthly_usd,
      hours_per_week: req.hours_per_week,
      suggested_split: split,
      adsense_share_of_target:
        req.target_monthly_usd > 0
          ? +(
              ((req.monthly_adsense_usd || 0) / req.target_monthly_usd) *
              100
            ).toFixed(1)
          : 0,
    };

    const ai = await runAiJson(buildProfitPrompt(req, metrics), {
      summary:
        "Multi-stream plan drafted — validate digital products before heavy build.",
      target_months: 6,
      streams: [
        {
          name: "AdSense",
          monthly_target_usd: String(split.adsense),
          why: "Baseline passive from views",
          first_actions: ["Improve RPM packaging", "Publish consistently"],
          effort: "medium",
        },
        {
          name: "Digital product",
          monthly_target_usd: String(split.digital_products),
          why: "Highest margin once validated",
          first_actions: ["Interview 5 viewers", "Ship MVP template"],
          effort: "high",
        },
      ],
      weekly_schedule: [],
      milestones: [],
      avoid: ["Chasing every platform before one product sells"],
    });

    return { tool: "revenue_planner" as const, metrics, ai };
  }

  if (req.tool === "roi_tracker") {
    const metrics = computeRoi({
      monthly_adsense_usd: req.monthly_adsense_usd || 0,
      other_revenue_usd: req.other_revenue_usd || 0,
      ad_spend_usd: req.ad_spend_usd || 0,
      tools_cost_usd: req.tools_cost_usd || 0,
      freelance_cost_usd: req.freelance_cost_usd || 0,
    });

    const ai = await runAiJson(buildProfitPrompt(req, metrics), {
      summary:
        metrics.profit >= 0
          ? "You are net positive — tighten costs for better ROI."
          : "Spending exceeds revenue — cut non-essential tools first.",
      health: metrics.healthy ? "ok" : metrics.profit < 0 ? "bleeding" : "weak",
      insights: [
        `Revenue $${metrics.revenue} vs costs $${metrics.costs}`,
        `ROI ${metrics.roi_pct}% · margin ${metrics.margin_pct}%`,
      ],
      cut_or_keep: [],
      improve_roi_actions: [
        "Kill unused SaaS",
        "Put spend only behind proven content formats",
      ],
      target_next_month: {
        max_tool_spend_usd: Math.max(20, Math.round(metrics.costs * 0.7)),
        revenue_focus: "One offer + one CTA in every video",
      },
    });

    return { tool: "roi_tracker" as const, metrics, ai };
  }

  if (req.tool === "brand_deals") {
    const avg =
      req.avg_views ||
      Math.round((req.monthly_views || 0) / Math.max(4, 1));
    const cpmv = 12;
    const base = Math.max(75, Math.round((avg / 1000) * cpmv));
    const rateContext = {
      avg_views: avg,
      engagement_rate_pct: req.engagement_rate_pct,
      package_starter: base,
      package_growth: Math.round(base * 1.8),
      package_flagship: Math.round(base * 3.2),
    };

    const ai = await runAiJson(buildProfitPrompt(req, rateContext), {
      summary: "Brand deal kit drafted — customize rates to niche demand.",
      positioning: `${req.niche} creator helping viewers get results`,
      ideal_brands: ["Tools in niche", "Education brands"],
      packages: [
        {
          name: "Starter",
          includes: ["60s integration", "1 story/community post"],
          price_range_usd: `$${base}–$${Math.round(base * 1.4)}`,
          best_for: "First-time brand tests",
        },
      ],
      outreach_sequence: [
        { day: 0, channel: "email", message_angle: "Audience fit + proof" },
      ],
      contract_checklist: [
        "Payment net-30 or 50% upfront",
        "Usage rights duration",
        "Exclusivity window",
      ],
      red_flags: ["Unlimited perpetual usage for free", "Payment only in product"],
      sample_pitch: `I create ${req.niche} content for ${req.subs} subscribers...`,
    });

    return { tool: "brand_deals" as const, rate_context: rateContext, ai };
  }

  // digital_product
  const ai = await runAiJson(buildProfitPrompt(req), {
    summary: "Digital product concepts ready — validate before building all modules.",
    products: [],
    funnel: ["YouTube video → free lead magnet → paid product"],
    upsells: [],
    warnings: ["Don't build a 10-hour course before 10 sales of a simple offer"],
  });

  return { tool: "digital_product" as const, ai };
}

async function runAiJson(prompt: string, fallback: Record<string, unknown>) {
  try {
    const raw = await callAI([{ role: "user", content: prompt }], {
      json: true,
      temperature: 0.45,
      max_tokens: 2400,
    });
    const parsed = safeJsonParse<Record<string, unknown> | null>(raw, null);
    if (parsed && typeof parsed === "object") return parsed;
    return fallback;
  } catch {
    return fallback;
  }
}
