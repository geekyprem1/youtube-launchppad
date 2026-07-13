export type AdsenseCheck = {
  id: string;
  label: string;
  status: "pass" | "fail" | "warn";
  detail: string;
  fix?: string;
};

export function runAdsenseChecklist(input: {
  subs: number;
  watch_hours_12m: number;
  shorts_views_90d: number;
  community_guidelines_ok: boolean;
  original_content: boolean;
  two_factor: boolean;
  linked_adsense: boolean;
  phone_verified: boolean;
  monetized: boolean;
}): { items: AdsenseCheck[]; ready_score: number; ypp_eligible: boolean } {
  const items: AdsenseCheck[] = [];

  // YPP long-form path: 1k subs + 4k watch hours OR Shorts path: 1k subs + 10M Shorts views / 90 days
  const longOk = input.subs >= 1000 && input.watch_hours_12m >= 4000;
  const shortsOk = input.subs >= 1000 && input.shorts_views_90d >= 10_000_000;
  const ypp_eligible = longOk || shortsOk || input.monetized;

  items.push({
    id: "subs",
    label: "1,000 subscribers",
    status: input.subs >= 1000 ? "pass" : "fail",
    detail: `${input.subs.toLocaleString()} subscribers`,
    fix: input.subs >= 1000 ? undefined : "Grow to 1,000 subs (consistent niche + CTAs).",
  });

  items.push({
    id: "watch_hours",
    label: "4,000 public watch hours (12 months)",
    status:
      input.watch_hours_12m >= 4000
        ? "pass"
        : input.watch_hours_12m >= 2000
          ? "warn"
          : "fail",
    detail: `${input.watch_hours_12m.toLocaleString()} hours`,
    fix:
      input.watch_hours_12m >= 4000
        ? undefined
        : "Longer videos + series playlists help accumulate hours faster.",
  });

  items.push({
    id: "shorts_views",
    label: "Shorts path: 10M valid Shorts views (90 days)",
    status: input.shorts_views_90d >= 10_000_000 ? "pass" : "warn",
    detail: `${input.shorts_views_90d.toLocaleString()} Shorts views (90d)`,
    fix:
      input.shorts_views_90d >= 10_000_000
        ? undefined
        : "Optional alternate path — useful if watch hours are low.",
  });

  items.push({
    id: "guidelines",
    label: "No active Community Guidelines strikes",
    status: input.community_guidelines_ok ? "pass" : "fail",
    detail: input.community_guidelines_ok
      ? "Marked clean"
      : "Guidelines issues can block YPP",
    fix: input.community_guidelines_ok
      ? undefined
      : "Resolve strikes and wait out restrictions before applying.",
  });

  items.push({
    id: "original",
    label: "Mostly original content (not reused)",
    status: input.original_content ? "pass" : "fail",
    detail: input.original_content
      ? "Original content claimed"
      : "Reused content risks rejection",
    fix: input.original_content
      ? undefined
      : "Publish original commentary/edit value; avoid pure reposts.",
  });

  items.push({
    id: "2fa",
    label: "2-Step Verification enabled",
    status: input.two_factor ? "pass" : "fail",
    detail: input.two_factor ? "Enabled" : "Not enabled",
    fix: input.two_factor ? undefined : "Enable 2FA on the Google account.",
  });

  items.push({
    id: "phone",
    label: "Phone verification",
    status: input.phone_verified ? "pass" : "warn",
    detail: input.phone_verified ? "Verified" : "Not verified",
    fix: input.phone_verified ? undefined : "Verify phone in YouTube Studio settings.",
  });

  items.push({
    id: "adsense",
    label: "AdSense account linked (when approved)",
    status: input.linked_adsense || input.monetized ? "pass" : "warn",
    detail: input.linked_adsense || input.monetized ? "Linked / monetized" : "Not linked yet",
    fix:
      input.linked_adsense || input.monetized
        ? undefined
        : "After YPP approval, link AdSense and complete tax/address forms.",
  });

  const pass = items.filter((i) => i.status === "pass").length;
  const ready_score = Math.round((pass / items.length) * 100);

  return { items, ready_score, ypp_eligible };
}
