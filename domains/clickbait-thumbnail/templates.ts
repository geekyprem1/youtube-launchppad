/**
 * ClickBoost thumbnail style templates (static pack).
 * Total: 18 distinct style packs for generation steering.
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
  {
    id: "vs-battle",
    name: "VS Battle",
    category: "Viral",
    description: "Two rivals face off with a bold center VS.",
    style_prompt:
      "Versus battle thumbnail: two subjects on opposite sides, giant VS in the center, sparks or clash effects, high energy rivalry composition",
    text_style: "A vs B or left/right labels",
    colors: "Red vs blue, electric contrast",
    best_for: "Comparisons, debates, matchups",
    sample_topics: ["iPhone vs Android 2026", "Free tools vs paid tools"],
  },
  {
    id: "gaming-neon",
    name: "Gaming Neon",
    category: "Gaming",
    description: "RGB neon, HUD overlays, esports hype energy.",
    style_prompt:
      "Gaming thumbnail: neon RGB glow, character or controller hero shot, HUD elements, particle trails, competitive esports energy, ultra sharp",
    text_style: "ALL CAPS hype words, glitch edge",
    colors: "Neon pink, cyan, purple black",
    best_for: "Gameplay, ranked climbs, reviews",
    sample_topics: ["I hit Radiant with a potato PC", "Secret OP loadout"],
  },
  {
    id: "fitness-flex",
    name: "Fitness Flex",
    category: "Fitness",
    description: "Body transformation energy, sweat, hard lighting.",
    style_prompt:
      "Fitness thumbnail: athletic body language, sweat sheen, hard directional lighting, gym background blur, motivational intensity",
    text_style: "SHORT + DAYS / RESULT claim",
    colors: "Black, red, white",
    best_for: "Workouts, weight loss, challenges",
    sample_topics: ["30-day body challenge results", "Home workout no equipment"],
  },
  {
    id: "food-crave",
    name: "Food Crave",
    category: "Food",
    description: "Macro food porn, steam, extreme close-up.",
    style_prompt:
      "Food thumbnail: extreme macro of dish, glistening texture, rising steam, shallow depth of field, mouth-watering appetizing light",
    text_style: "Recipe name or TIME claim",
    colors: "Warm orange, cream, deep red",
    best_for: "Recipes, street food, mukbangs",
    sample_topics: ["Perfect crispy chicken in 10 min", "Street food that broke me"],
  },
  {
    id: "minimal-authority",
    name: "Clean Authority",
    category: "Education",
    description: "Minimal expert look — calm, premium, credible.",
    style_prompt:
      "Premium minimal thumbnail: clean negative space, one confident subject or icon, soft gradient backdrop, editorial magazine quality, no clutter",
    text_style: "Elegant short phrase, high contrast",
    colors: "Navy, white, soft gold",
    best_for: "Explainers, courses, thought leadership",
    sample_topics: ["The only productivity system I use", "How systems beat motivation"],
  },
  {
    id: "red-circle",
    name: "Red Circle",
    category: "Viral",
    description: "Classic red circle/arrow on the key detail.",
    style_prompt:
      "Classic YouTube clickbait: real photo composition, thick red circle or arrow highlighting one critical detail, slight zoom, urgent attention grab",
    text_style: "YOU WON'T BELIEVE or WHAT?!",
    colors: "Natural photo + pure red overlay",
    best_for: "Fails, finds, hidden details",
    sample_topics: ["Look at the top-right corner", "They hid this in plain sight"],
  },
  {
    id: "cinematic-trailer",
    name: "Cinematic Trailer",
    category: "Entertainment",
    description: "Movie-poster lighting, epic scale, drama.",
    style_prompt:
      "Cinematic trailer thumbnail: anamorphic bokeh, volumetric god rays, epic scale, film-grain subtle, blockbuster poster composition",
    text_style: "Title case, 2–3 dramatic words",
    colors: "Teal and orange, deep blacks",
    best_for: "Story videos, recaps, film-style content",
    sample_topics: ["The night everything changed", "This true story feels fake"],
  },
  {
    id: "news-breaking",
    name: "Breaking News",
    category: "News",
    description: "Urgent banner style, bold headlines, live energy.",
    style_prompt:
      "Breaking news thumbnail: urgent lower-third banner feel, bold headline block, serious face or key image, LIVE / BREAKING energy, high urgency",
    text_style: "BREAKING + short claim",
    colors: "Red, white, dark navy",
    best_for: "Updates, drama, industry news",
    sample_topics: ["YouTube just changed the algorithm", "This update ruins small channels"],
  },
  {
    id: "cartoon-pop",
    name: "Cartoon Pop",
    category: "Kids / Fun",
    description: "Bold cartoon outlines, playful sticker energy.",
    style_prompt:
      "Cartoon pop thumbnail: bold outlines, sticker-like characters, exaggerated expressions, playful props, comic-book energy, super readable shapes",
    text_style: "Bubble letters, fun exclamation",
    colors: "Primary rainbow, thick black lines",
    best_for: "Kids, comedy, animated explainers",
    sample_topics: ["If animals had jobs", "School rules that make no sense"],
  },
  {
    id: "luxury-flex",
    name: "Luxury Flex",
    category: "Lifestyle",
    description: "Rich textures, gold accents, aspirational lifestyle.",
    style_prompt:
      "Luxury lifestyle thumbnail: rich textures, gold accents, premium products or cars, soft bokeh, aspirational wealth aesthetic, crisp editorial lighting",
    text_style: "Quiet flex 2–3 words",
    colors: "Black, gold, champagne",
    best_for: "Luxury reviews, travel, success stories",
    sample_topics: ["$1 hotel vs $10,000 suite", "My first class flight experience"],
  },
];

export function getThumbTemplate(id: string) {
  return CLICKBOOST_TEMPLATES.find((t) => t.id === id);
}
