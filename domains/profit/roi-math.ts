/**
 * Simple ROI helpers for Profit Accelerator.
 */

export function computeRoi(input: {
  monthly_adsense_usd: number;
  other_revenue_usd: number;
  ad_spend_usd: number;
  tools_cost_usd: number;
  freelance_cost_usd: number;
}) {
  const revenue =
    (input.monthly_adsense_usd || 0) + (input.other_revenue_usd || 0);
  const costs =
    (input.ad_spend_usd || 0) +
    (input.tools_cost_usd || 0) +
    (input.freelance_cost_usd || 0);
  const profit = revenue - costs;
  const roi_pct =
    costs > 0 ? +((profit / costs) * 100).toFixed(1) : revenue > 0 ? 999 : 0;
  const margin_pct =
    revenue > 0 ? +((profit / revenue) * 100).toFixed(1) : 0;

  return {
    revenue: +revenue.toFixed(2),
    costs: +costs.toFixed(2),
    profit: +profit.toFixed(2),
    roi_pct,
    margin_pct,
    healthy: profit >= 0 && (costs === 0 || roi_pct >= 50),
  };
}

/** Rough monthly target split across streams */
export function suggestStreamSplit(targetMonthly: number, hasAds: boolean) {
  const ads = hasAds ? Math.round(targetMonthly * 0.25) : 0;
  const rest = targetMonthly - ads;
  return {
    adsense: ads,
    digital_products: Math.round(rest * 0.4),
    affiliates: Math.round(rest * 0.25),
    brand_deals: Math.round(rest * 0.25),
    services: Math.round(rest * 0.1),
  };
}
