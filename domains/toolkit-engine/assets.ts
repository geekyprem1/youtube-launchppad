/**
 * Creator Toolkit X — reusable creator assets (static library).
 */

export type CreatorAsset = {
  id: string;
  category: "cta" | "description" | "pinned" | "community" | "end_screen" | "script_block";
  title: string;
  body: string;
  tags: string[];
};

export const CREATOR_ASSETS: CreatorAsset[] = [
  {
    id: "cta-sub-1",
    category: "cta",
    title: "Soft subscribe CTA",
    body: "If this helped you even a little, hit subscribe so you don't miss the next one.",
    tags: ["subscribe", "soft"],
  },
  {
    id: "cta-sub-2",
    category: "cta",
    title: "Direct subscribe CTA",
    body: "Subscribe right now — I post every week with no fluff.",
    tags: ["subscribe", "direct"],
  },
  {
    id: "cta-comment",
    category: "cta",
    title: "Comment prompt",
    body: "Drop a comment: which tip are you trying this week? I read every one.",
    tags: ["engagement"],
  },
  {
    id: "desc-hook",
    category: "description",
    title: "Description hook block",
    body: "In this video you'll learn exactly how to [OUTCOME] without [PAIN].\n\nTimestamps:\n0:00 Intro\n",
    tags: ["seo", "structure"],
  },
  {
    id: "desc-links",
    category: "description",
    title: "Links section",
    body: "🔗 Resources mentioned:\n- [Link 1]\n- [Link 2]\n\n📩 Business: your@email.com",
    tags: ["links"],
  },
  {
    id: "pinned-value",
    category: "pinned",
    title: "Pinned comment — value",
    body: "Free checklist from this video: [LINK]\nAlso — watch this next: [RELATED VIDEO]",
    tags: ["pinned"],
  },
  {
    id: "community-poll",
    category: "community",
    title: "Community poll idea",
    body: "Quick poll: which video should I make next?\nA) …\nB) …\nC) …",
    tags: ["community"],
  },
  {
    id: "end-screen",
    category: "end_screen",
    title: "End screen script",
    body: "Before you go — this video pairs perfectly with the one on screen. Click it, and I'll see you there.",
    tags: ["retention"],
  },
  {
    id: "script-hook-pattern",
    category: "script_block",
    title: "Hook pattern",
    body: "Most people [COMMON MISTAKE]. Here's the 60-second fix that actually works…",
    tags: ["hook", "script"],
  },
  {
    id: "script-transition",
    category: "script_block",
    title: "Section transition",
    body: "Okay — now that you have the foundation, this next part is where most people quit… don't.",
    tags: ["script"],
  },
];

export const PUBLISH_CHECKLIST = [
  { id: "title", label: "Title finalized (mobile-readable, keyword early)" },
  { id: "thumb", label: "Custom thumbnail uploaded (high contrast)" },
  { id: "desc", label: "Description: hook in first 2 lines + links" },
  { id: "tags", label: "Tags: 8–15 relevant (broad + long-tail)" },
  { id: "chapters", label: "Chapters / timestamps added (long-form)" },
  { id: "end", label: "End screen: subscribe + next video" },
  { id: "cards", label: "Cards set at key moments" },
  { id: "playlist", label: "Added to playlist / series" },
  { id: "audio", label: "Audio levels checked / loudness OK" },
  { id: "captions", label: "Captions reviewed (auto-captions fixed)" },
  { id: "visibility", label: "Visibility + premiere/schedule decided" },
  { id: "community", label: "Community post / social teaser ready" },
];

export type ToolkitContentTemplate = {
  id: string;
  name: string;
  niche: string;
  description: string;
  sample_topic: string;
  title_formulas: string[];
  description_skeleton: string;
  tags_seed: string[];
};

export const TOOLKIT_CONTENT_TEMPLATES: ToolkitContentTemplate[] = [
  {
    id: "how-to",
    name: "How-To Tutorial",
    niche: "Education",
    description: "Step-by-step educational video kit.",
    sample_topic: "How to start freelancing with zero clients",
    title_formulas: [
      "How to {outcome} (step-by-step)",
      "{outcome} for beginners in 2026",
      "The only {topic} guide you need",
    ],
    description_skeleton:
      "Learn how to {outcome}.\n\nIn this video:\n- Step 1\n- Step 2\n- Step 3\n\nTimestamps:\n0:00 Intro\n",
    tags_seed: ["how to", "tutorial", "beginner", "guide"],
  },
  {
    id: "listicle",
    name: "Listicle / Top N",
    niche: "General",
    description: "Numbered list format for high CTR.",
    sample_topic: "7 free AI tools that replace paid software",
    title_formulas: [
      "{N} {things} that {benefit}",
      "Stop using {old} — try these {N} instead",
      "{N} mistakes killing your {result}",
    ],
    description_skeleton:
      "Here are {N} {things} you can use today.\n\n#1 …\n\nWhich one will you try? Comment below.",
    tags_seed: ["top", "best", "list", "tools"],
  },
  {
    id: "story",
    name: "Story / Case study",
    niche: "Storytelling",
    description: "Narrative arc for retention.",
    sample_topic: "How I went from 0 to 10k subs in 6 months",
    title_formulas: [
      "How I {result} (honest story)",
      "I tried {thing} for 30 days",
      "What nobody tells you about {topic}",
    ],
    description_skeleton:
      "This is the real story of {journey}.\n\nKey lessons:\n1.\n2.\n3.\n",
    tags_seed: ["story", "case study", "journey"],
  },
  {
    id: "review",
    name: "Review / vs",
    niche: "Reviews",
    description: "Product or tool review packaging.",
    sample_topic: "Notion vs Obsidian for students",
    title_formulas: [
      "{A} vs {B}: which should you buy?",
      "I tested {product} for 30 days",
      "Is {product} worth it in 2026?",
    ],
    description_skeleton:
      "Honest review of {product}.\n\nPros:\nCons:\nWho it's for:\nWho should skip:\n",
    tags_seed: ["review", "vs", "worth it"],
  },
  {
    id: "shorts-hook",
    name: "Shorts package",
    niche: "Shorts",
    description: "Vertical short packaging.",
    sample_topic: "This one habit fixed my focus",
    title_formulas: [
      "Do this before {time}",
      "Stop {bad habit}",
      "{Shocking claim} (watch)",
    ],
    description_skeleton: "{hook line}\n\nFollow for daily tips.\n#shorts",
    tags_seed: ["shorts", "viral", "tips"],
  },
];
