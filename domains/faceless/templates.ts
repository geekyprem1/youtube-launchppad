/**
 * Curated faceless channel templates (static pack — no AI cost).
 */

export type FacelessTemplate = {
  id: string;
  name: string;
  niche: string;
  style: string;
  format: "long" | "short" | "both";
  tone: string;
  description: string;
  sample_topics: string[];
  visual_style: string;
  voice_style: string;
  thumbnail_formula: string;
  script_structure: string[];
};

export const FACELESS_TEMPLATES: FacelessTemplate[] = [
  {
    id: "reddit-stories",
    name: "Reddit Story Time",
    niche: "True stories / drama",
    style: "Narrated story + stock / simple motion",
    format: "both",
    tone: "dramatic, curious",
    description:
      "Viral Reddit-style stories with strong hooks, on-screen text, and calm narration.",
    sample_topics: [
      "AITA for refusing to pay for my sister's wedding",
      "My roommate secretly charged my card for months",
      "I found out my best friend was catfishing me",
    ],
    visual_style: "Dark UI, big captions, subtle zooms on text cards",
    voice_style: "Neutral storyteller, slightly tense",
    thumbnail_formula: "Shocked face emoji or bold text + red/black contrast",
    script_structure: [
      "0–10s: Hook question / shock line",
      "Context: who, where, stakes",
      "Rising conflict",
      "Twist",
      "Outcome + moral CTA",
    ],
  },
  {
    id: "facts-listicle",
    name: "Mind-Blowing Facts",
    niche: "Education / curiosity",
    style: "Listicle voiceover + b-roll",
    format: "both",
    tone: "energetic, wonder",
    description:
      "Top-N facts or ‘things you didn’t know’ with fast pacing and pattern interrupts.",
    sample_topics: [
      "7 space facts that sound fake but are real",
      "5 human body facts doctors wish you knew",
      "10 history facts erased from textbooks",
    ],
    visual_style: "Quick cuts, bold numbers, stock footage",
    voice_style: "Upbeat documentary",
    thumbnail_formula: "Big number + one surprising image + short claim",
    script_structure: [
      "Hook with the wildest fact teaser",
      "Fact 1…N with micro-stories",
      "Callback to hook",
      "Subscribe CTA",
    ],
  },
  {
    id: "finance-explain",
    name: "Money Explainer",
    niche: "Personal finance",
    style: "Explain + motion graphics style prompts",
    format: "long",
    tone: "clear, trustworthy",
    description:
      "Faceless finance channel: simple frameworks, examples, and soft CTAs.",
    sample_topics: [
      "How high-income people budget (simple system)",
      "The debt payoff order that actually works",
      "Why your savings rate beats your salary",
    ],
    visual_style: "Clean charts language, green/blue palette, simple icons",
    voice_style: "Calm expert teacher",
    thumbnail_formula: "Money symbol + contrast text (HOW / STOP / SECRET)",
    script_structure: [
      "Problem the viewer feels",
      "Promise of system",
      "3–5 steps with examples",
      "Common mistakes",
      "CTA download/subscribe",
    ],
  },
  {
    id: "horror-narration",
    name: "Horror Narration",
    niche: "Creepypasta / scary stories",
    style: "Slow narration + dark ambience prompts",
    format: "long",
    tone: "eerie, slow-burn",
    description:
      "Long-form scary stories with atmospheric delivery and chapter-like beats.",
    sample_topics: [
      "The night shift at a hotel that shouldn't exist",
      "What I found in the basement of my new house",
      "Don't answer the door at 3:33 AM",
    ],
    visual_style: "Dark grain, fog, still images with slow pan",
    voice_style: "Low, slow, intimate",
    thumbnail_formula: "Single eerie object + minimal text",
    script_structure: [
      "Cold open scare",
      "Setup normal world",
      "Rules break",
      "Escalation",
      "Ambiguous ending + CTA",
    ],
  },
  {
    id: "tech-news",
    name: "AI / Tech News Digest",
    niche: "AI & tech news",
    style: "News roundup + screen-style visuals",
    format: "both",
    tone: "fast, informative",
    description:
      "Weekly AI tools and tech stories for faceless creators who want authority content.",
    sample_topics: [
      "3 AI tools that replaced expensive software this week",
      "This open-source model just shocked the industry",
      "Google vs OpenAI: what actually changed",
    ],
    visual_style: "Sleek UI mockups, logos (described), kinetic text",
    voice_style: "Tech YouTuber energy",
    thumbnail_formula: "Product/tool name + ‘NEW’ + reaction-style text",
    script_structure: [
      "Headline hook",
      "Why it matters",
      "How it works simply",
      "Who should care",
      "CTA for more digests",
    ],
  },
  {
    id: "motivation-clips",
    name: "Motivation / Stoic Clips",
    niche: "Motivation",
    style: "Quote + cinematic stock",
    format: "short",
    tone: "intense, inspiring",
    description:
      "Short-form faceless motivation with punchy lines and high-retention hooks.",
    sample_topics: [
      "Stop waiting for motivation — do this instead",
      "The 5AM habit that rewired my discipline",
      "Why comfort is quietly killing your goals",
    ],
    visual_style: "Cinematic b-roll, bold captions, beat cuts",
    voice_style: "Powerful, paced",
    thumbnail_formula: "One strong phrase + high contrast face-less imagery",
    script_structure: [
      "Aggressive hook line",
      "Pain truth",
      "One rule / system",
      "Challenge CTA",
    ],
  },
  {
    id: "history-documentary",
    name: "Mini History Documentary",
    niche: "History",
    style: "Documentary voice + stills",
    format: "long",
    tone: "narrative, cinematic",
    description:
      "Faceless history docs with story arcs, not dry timelines.",
    sample_topics: [
      "The empire that vanished overnight",
      "The invention that accidentally changed war",
      "A spy story they buried for 50 years",
    ],
    visual_style: "Archival feel, maps, slow pans",
    voice_style: "Documentary narrator",
    thumbnail_formula: "Historical figure/object + mystery question",
    script_structure: [
      "Tease the ending mystery",
      "Setting the world",
      "Key characters",
      "Turning point",
      "Aftermath + lesson",
    ],
  },
  {
    id: "product-review-faceless",
    name: "Faceless Product Review",
    niche: "Reviews / affiliate",
    style: "B-roll demo language + honest pros/cons",
    format: "long",
    tone: "honest, helpful",
    description:
      "Review format without face-cam: unbox narrative, tests, verdict.",
    sample_topics: [
      "I tested this $50 gadget for 30 days",
      "Cheap vs premium: which should you buy?",
      "This tool wasted my money — here's why",
    ],
    visual_style: "Product shots, comparison tables, screen capture prompts",
    voice_style: "Friendly reviewer",
    thumbnail_formula: "Product + YES/NO or score badge",
    script_structure: [
      "Who this is for",
      "What I tested",
      "Pros / cons",
      "Who should skip",
      "Final verdict + CTA",
    ],
  },
];

export function getTemplateById(id: string): FacelessTemplate | undefined {
  return FACELESS_TEMPLATES.find((t) => t.id === id);
}
