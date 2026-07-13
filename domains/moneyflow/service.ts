import { callAI } from "@/lib/openrouter";
import { safeJsonParse } from "@/lib/utils";
import { runAdsenseChecklist } from "./adsense-checklist";
import { estimateNicheRpm, projectRevenue } from "./rpm-math";
import { buildMoneyflowPrompt } from "./prompts";
import type { MoneyflowRequest } from "./types";

export async function processMoneyflow(req: MoneyflowRequest) {
  if (req.tool === "rpm") {
    const est = estimateNicheRpm(req.niche, req.country || "United States");
    const rpm =
      typeof req.rpm_usd === "number" && req.rpm_usd > 0
        ? req.rpm_usd
        : est.rpm_mid;
    const views = req.monthly_views || 0;
    const revMid = projectRevenue(views, rpm);
    const revLow = projectRevenue(views, est.rpm_low);
    const revHigh = projectRevenue(views, est.rpm_high);

    const metrics = {
      rpm_used: rpm,
      estimate: est,
      revenue: {
        low_monthly: revLow.monthly,
        mid_monthly: revMid.monthly,
        high_monthly: revHigh.monthly,
        mid_yearly: revMid.yearly,
      },
      cpm_input: req.cpm_usd ?? null,
      watch_hours_month: req.watch_hours_month,
    };

    const ai = await runAiJson(buildMoneyflowPrompt(req, metrics), {
      summary: "RPM estimate ready — improve audience geo quality and content category fit.",
      rpm_drivers: ["Audience purchasing power", "Niche advertiser demand", "Seasonality"],
      improve_tips: ["Target higher-intent keywords", "Package content for advertiser-friendly topics"],
      seasonality_note: "Q4 often pays higher in many niches.",
      cautions: ["Never guarantee earnings to your audience."],
    });

    return { tool: "rpm" as const, metrics, ai };
  }

  if (req.tool === "adsense") {
    const checklist = runAdsenseChecklist({
      subs: req.subs || 0,
      watch_hours_12m: req.watch_hours_12m || 0,
      shorts_views_90d: req.shorts_views_90d || 0,
      community_guidelines_ok: req.community_guidelines_ok ?? true,
      original_content: req.original_content ?? true,
      two_factor: req.two_factor ?? false,
      linked_adsense: req.linked_adsense ?? false,
      phone_verified: req.phone_verified ?? false,
      monetized: req.monetized ?? false,
    });

    const ai = await runAiJson(buildMoneyflowPrompt(req, checklist), {
      summary: checklist.ypp_eligible
        ? "You appear close to or at YPP thresholds — finish account setup items."
        : "Focus on the failed checklist items first.",
      eligibility_read: checklist.ypp_eligible ? "eligible" : "not_yet",
      priority_actions: checklist.items
        .filter((i) => i.status !== "pass")
        .slice(0, 4)
        .map((i) => i.fix || i.label),
      application_tips: ["Apply only when metrics are stable for a few days."],
      after_approval: ["Link AdSense", "Enable mid-roll when videos are long enough"],
      policy_cautions: ["Avoid misleading metadata and reused content."],
    });

    return { tool: "adsense" as const, checklist, ai };
  }

  if (req.tool === "sponsorship") {
    const avg = req.avg_views_per_video || Math.round((req.monthly_views || 0) / 4);
    // Very rough CPMv-style sponsorship floor (educational)
    const cpmv = 10; // $10 per 1k views integrated baseline
    const integrated = Math.round((avg / 1000) * cpmv);
    const rateContext = {
      avg_views: avg,
      rough_integrated_usd: Math.max(50, integrated),
      rough_dedicated_usd: Math.max(100, integrated * 2.5),
    };

    const ai = await runAiJson(buildMoneyflowPrompt(req, rateContext), {
      summary: "Sponsorship kit draft ready — customize rates to your niche.",
      media_kit_bullets: [
        `${req.subs} subscribers`,
        `${avg} average views (estimate)`,
        req.niche,
      ],
      rate_card: {
        integrated_mention_usd: `$${Math.max(50, integrated)}–$${Math.max(80, integrated * 1.5)}`,
        dedicated_video_usd: `$${Math.max(100, integrated * 2)}–$${Math.max(200, integrated * 3.5)}`,
        short_usd: `$${Math.max(40, Math.round(integrated * 0.6))}–$${Math.max(75, integrated)}`,
        notes: "Educational ranges from view-based heuristics.",
      },
      pitch_email: `Hi {Brand},\n\nI create ${req.niche} content for an audience of ${req.subs} subscribers. I'd love to explore a partnership...\n\nBest,\n{You}`,
      target_brand_types: ["Tools in your niche", "Education / courses", "Relevant SaaS"],
      negotiation_tips: ["Lead with audience fit, not just views", "Offer a package of 1 long + 2 Shorts"],
    });

    return { tool: "sponsorship" as const, rate_context: rateContext, ai };
  }

  // roadmap | affiliate
  const fallback =
    req.tool === "affiliate"
      ? {
          summary: "Affiliate angles drafted for your niche.",
          offers: [],
          content_ideas: [],
          disclosure_reminder: "Always disclose affiliate relationships.",
        }
      : {
          summary: "90-day monetization roadmap ready.",
          stage: req.monetized ? "growth" : "pre-ypp",
          milestones: [],
          revenue_streams_order: ["AdSense", "Affiliate", "Sponsorships"],
          quick_wins: [],
          risks: [],
          next_7_days: [],
        };

  const ai = await runAiJson(buildMoneyflowPrompt(req), fallback);
  return { tool: req.tool, ai };
}

async function runAiJson(prompt: string, fallback: Record<string, unknown>) {
  try {
    const raw = await callAI([{ role: "user", content: prompt }], {
      json: true,
      temperature: 0.45,
      max_tokens: 2200,
    });
    const parsed = safeJsonParse<Record<string, unknown> | null>(raw, null);
    if (parsed && typeof parsed === "object") return parsed;
    return fallback;
  } catch {
    return fallback;
  }
}
