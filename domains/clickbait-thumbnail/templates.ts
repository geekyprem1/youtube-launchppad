/**
 * ClickBoost thumbnail style templates (static pack).
 */

export type ThumbTemplate = {
  id: string;
  name: string;
  category: string;
  description: string;
  /** Injected into image prompt builder */
  style_prompt: string;
  text_style: string;
  colors: string;
  best_for: string;
  sample_topics: string[];
};

export const CLICKBOOST_TEMPLATES: ThumbTemplate[] = [
  {
    id: "mrbeast-energy",
    name: "Beast Energy",
    category: "Viral",
    description: "Exaggerated face energy, big props, high saturation.",
    style_prompt:
      "MrBeast-style hyperreal clickbait: extreme facial reaction, oversized prop, yellow/red accents, comic energy, ultra sharp",
    text_style: "2-4 huge bold words, yellow with black outline",
    colors: "Red, yellow, cyan contrast",
    best_for: "Challenges, big numbers, experiments",
    sample_topics: ["I spent $1 vs $100,000", "Last to leave wins"],
  },
  {
    id: "curiosity-gap",
    name: "Curiosity Gap",
    category: "Viral",
    description: "Blurred secret + arrow pointing to mystery element.",
    style_prompt:
      "Curiosity-gap thumbnail: one clear subject, mysterious blurred object, red arrow or circle highlight, tension",
    text_style: "Question or incomplete phrase",
    colors: "Dark background, neon accent",
    best_for: "Storytime, reveals, investigations",
    sample_topics: ["What I found in my attic", "Don't open this box"],
  },
  {
    id: "before-after",
    name: "Before / After",
    category: "Transformation",
    description: "Split composition showing contrast transformation.",
    style_prompt:
      "Split-screen before/after thumbnail, dramatic contrast between left and right, clean divider, high clarity",
    text_style: "BEFORE | AFTER or vs",
    colors: "Muted left, vibrant right",
    best_for: "Makeovers, results, tutorials",
    sample_topics: ["Room makeover in 24 hours", "From broke to $10k/mo"],
  },
  {
    id: "tech-glow",
    name: "Tech Glow",
    category: "Tech",
    description: "Product-forward, sleek UI, blue neon tech vibe.",
    style_prompt:
      "Sleek tech product thumbnail, glowing edges, dark gradient, futuristic UI elements, crisp product focus",
    text_style: "Product name + NEW / AI",
    colors: "Blue, purple, black",
    best_for: "AI tools, gadgets, software",
    sample_topics: ["This AI tool replaces Photoshop", "iPhone 17 leak"],
  },
  {
    id: "finance-green",
    name: "Money Magnet",
    category: "Finance",
    description: "Cash/growth visuals, trustworthy but bold.",
    style_prompt:
      "Finance clickbait: money, charts shooting up, green accents, confident energy, clean composition",
    text_style: "HOW / STOP / SECRET + $",
    colors: "Green, black, gold",
    best_for: "Investing, side hustles, money tips",
    sample_topics: ["How I save $1000/month", "Stop these 5 money leaks"],
  },
  {
    id: "horror-dark",
    name: "Horror Dark",
    category: "Horror",
    description: "Atmospheric fear, single eerie subject.",
    style_prompt:
      "Horror thumbnail: dark grain, single eerie subject, fog, desaturated with one red accent, unsettling",
    text_style: "Minimal 1-3 words",
    colors: "Black, gray, blood red",
    best_for: "Scary stories, true crime hooks",
    sample_topics: ["Don't go in the basement", "3:33 AM knock"],
  },
  {
    id: "listicle-pop",
    name: "Listicle Pop",
    category: "Education",
    description: "Giant number + one iconic image.",
    style_prompt:
      "Listicle thumbnail with huge number as focal point, bright pop colors, simple iconic object, high readability",
    text_style: "Giant number + short claim",
    colors: "Orange, white, blue",
    best_for: "Top 5/7/10 videos",
    sample_topics: ["7 facts that sound fake", "5 tools I use daily"],
  },
  {
    id: "face-reaction",
    name: "Reaction Face",
    category: "Entertainment",
    description: "Close-up emotion face dominates the frame.",
    style_prompt:
      "Extreme close-up reaction face, wide eyes, mouth open, high detail skin, background blur, viral YouTube style",
    text_style: "Shock word only",
    colors: "Warm skin tones + bold accent",
    best_for: "Reactions, opinions, drama",
    sample_topics: ["I can't believe this worked", "They lied about this"],
  },
];

export function getThumbTemplate(id: string) {
  return CLICKBOOST_TEMPLATES.find((t) => t.id === id);
}
