/**
 * Infinity VIP — premium template pack (static exclusive content).
 */

export type PremiumTemplate = {
  id: string;
  tier: "vip";
  name: string;
  category: string;
  description: string;
  use_case: string;
  script_hook: string;
  title_formulas: string[];
  thumbnail_recipe: string;
  posting_cadence: string;
};

export const VIP_PREMIUM_TEMPLATES: PremiumTemplate[] = [
  {
    id: "vip-authority-series",
    tier: "vip",
    name: "Authority Series Engine",
    category: "Growth",
    description:
      "4-video series framework that positions you as the go-to expert in a micro-niche.",
    use_case: "New channels that need trust fast",
    script_hook:
      "Everyone is teaching {topic} wrong. In this series, I'll show the system pros actually use.",
    title_formulas: [
      "The {topic} system nobody teaches",
      "I rebuilt my {result} with this framework",
      "Stop {bad habit} — do this instead (pro method)",
    ],
    thumbnail_recipe: "You + whiteboard/diagram energy OR bold framework name + arrow",
    posting_cadence: "2 long / week for 2 weeks, then recap Shorts",
  },
  {
    id: "vip-faceless-cash",
    tier: "vip",
    name: "Faceless Cashflow Loop",
    category: "Monetization",
    description:
      "Content → free lead magnet → paid digital product loop without face cam.",
    use_case: "Faceless creators monetizing past ads",
    script_hook:
      "This video is free. The system behind it made more than AdSense — here's the loop.",
    title_formulas: [
      "How faceless channels make money in 2026",
      "AdSense is the worst way I make money",
      "My faceless product sold while I slept",
    ],
    thumbnail_recipe: "Laptop + money motif + ‘SYSTEM’ text",
    posting_cadence: "1 long case study + 4 Shorts clips / week",
  },
  {
    id: "vip-retention-arcs",
    tier: "vip",
    name: "Retention Story Arcs",
    category: "Retention",
    description:
      "Open loops and pattern interrupts mapped to 8–12 minute videos.",
    use_case: "Long-form watch time improvement",
    script_hook:
      "Don't skip — the mistake that costs people hours is in the middle of this video.",
    title_formulas: [
      "Why viewers leave at minute 3 (fix)",
      "The retention trick Netflix uses",
      "I fixed my drop-off with one structure",
    ],
    thumbnail_recipe: "Graph going up + shocked emoji style (faceless OK)",
    posting_cadence: "Apply to next 3 uploads, compare analytics",
  },
  {
    id: "vip-brand-magnet",
    tier: "vip",
    name: "Brand Magnet Episodes",
    category: "Sponsorships",
    description:
      "Episode formats brands want to sponsor — built-in integration slots.",
    use_case: "Channels ready for brand deals",
    script_hook:
      "Brands pay for attention that feels native. Here's how to structure a video they love.",
    title_formulas: [
      "The video format brands pay for",
      "How I pitch without sounding desperate",
      "My $X sponsorship structure (template)",
    ],
    thumbnail_recipe: "Media kit vibe + clean product placement mock",
    posting_cadence: "1 sponsored-ready format / week",
  },
  {
    id: "vip-shorts-flywheel",
    tier: "vip",
    name: "Shorts → Long Flywheel",
    category: "Distribution",
    description:
      "Repurpose one long video into 8 Shorts with intentional hooks.",
    use_case: "Growth via Shorts discovery",
    script_hook: "This 8-second line got more views than my full video — then sent traffic back.",
    title_formulas: [
      "Turn 1 video into 8 Shorts (system)",
      "Shorts that actually convert to subs",
      "The hook formula I reuse every day",
    ],
    thumbnail_recipe: "Phone frame + bold hook text",
    posting_cadence: "1 long → 8 Shorts over 10 days",
  },
  {
    id: "vip-crisis-comeback",
    tier: "vip",
    name: "Algorithm Comeback Plan",
    category: "Recovery",
    description:
      "14-day plan when views tank — diagnostics + content experiments.",
    use_case: "Channels in a dip",
    script_hook:
      "Views died. Here's the 14-day comeback I use before changing niches.",
    title_formulas: [
      "YouTube killed my views — what I did",
      "14-day algorithm comeback plan",
      "Don't rebrand yet — try this first",
    ],
    thumbnail_recipe: "Down arrow → up arrow visual story",
    posting_cadence: "Daily diagnostics + 3 experiments / week",
  },
];

export const VIP_PERKS = [
  {
    title: "All CreatorOS tools",
    detail: "Infinity unlocks every module (same as oto12 access).",
  },
  {
    title: "Premium template pack",
    detail: "Exclusive series, monetization, and recovery frameworks.",
  },
  {
    title: "VIP badge",
    detail: "Shown in your workspace sidebar for Infinity members.",
  },
  {
    title: "Priority playbooks",
    detail: "High-leverage posting cadences and sponsorship formats.",
  },
  {
    title: "Future VIP drops",
    detail: "New premium templates land here first.",
  },
];
