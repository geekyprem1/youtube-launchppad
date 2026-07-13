/**
 * Simple RPM / revenue estimators (educational ranges, not guarantees).
 */

export function estimateNicheRpm(niche: string, country: string): {
  rpm_low: number;
  rpm_mid: number;
  rpm_high: number;
  note: string;
} {
  const n = niche.toLowerCase();
  const c = country.toLowerCase();

  // Base mid RPM (USD per 1000 views) by niche heuristics
  let mid = 2.5;
  if (/financ|invest|insur|crypto|mortgage|tax|saas|b2b|software/.test(n)) mid = 8;
  else if (/tech|ai|gadget|review|phone/.test(n)) mid = 4.5;
  else if (/health|fitness|beauty|skincare/.test(n)) mid = 3.5;
  else if (/game|minecraft|roblox|fortnite/.test(n)) mid = 1.8;
  else if (/kids|toy|cartoon/.test(n)) mid = 1.2;
  else if (/educat|tutorial|how to|course/.test(n)) mid = 3.2;
  else if (/travel|food|vlog|lifestyle/.test(n)) mid = 2.2;

  // Geo adjustment
  if (/united states|usa|us\b|canada|uk|united kingdom|australia|germany|nordic/.test(c)) {
    mid *= 1.15;
  } else if (/india|pakistan|bangladesh|nigeria|philippines|indonesia|brazil/.test(c)) {
    mid *= 0.45;
  } else if (/global|worldwide|mixed/.test(c)) {
    mid *= 0.85;
  }

  const low = Math.max(0.3, +(mid * 0.55).toFixed(2));
  const high = +(mid * 1.65).toFixed(2);
  mid = +mid.toFixed(2);

  return {
    rpm_low: low,
    rpm_mid: mid,
    rpm_high: high,
    note: "Estimates only — real RPM depends on seasonality, audience geo, content category, and AdSense fill.",
  };
}

export function projectRevenue(monthlyViews: number, rpm: number) {
  const monthly = (monthlyViews / 1000) * rpm;
  return {
    monthly: +monthly.toFixed(2),
    yearly: +(monthly * 12).toFixed(2),
  };
}
