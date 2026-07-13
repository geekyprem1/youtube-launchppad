/**
 * Deterministic pre-publish checks for RankPilot (OTO4).
 * Scores are rule-based; AI layer adds narrative + suggestions.
 */

import type { ChecklistItem, UploadChecklistRequest } from "./types";

function parseTags(raw: string): string[] {
  return raw
    .split(/[,|\n]/)
    .map((t) => t.trim())
    .filter(Boolean);
}

export function runUploadChecklist(input: UploadChecklistRequest): {
  items: ChecklistItem[];
  overall_score: number;
  pass_count: number;
  warn_count: number;
  fail_count: number;
} {
  const title = input.title.trim();
  const description = (input.description || "").trim();
  const tags = parseTags(input.tags || "");
  const items: ChecklistItem[] = [];

  // Title length
  const titleLen = title.length;
  if (titleLen >= 40 && titleLen <= 70) {
    items.push({
      id: "title_length",
      category: "title",
      label: "Title length (40–70 chars)",
      status: "pass",
      score: 100,
      detail: `${titleLen} characters — solid for mobile + desktop.`,
    });
  } else if (titleLen >= 30 && titleLen < 40) {
    items.push({
      id: "title_length",
      category: "title",
      label: "Title length (40–70 chars)",
      status: "warn",
      score: 65,
      detail: `${titleLen} characters — a bit short; room for a stronger keyword.`,
      fix: "Add a specific outcome, number, or year without stuffing.",
    });
  } else if (titleLen > 70 && titleLen <= 90) {
    items.push({
      id: "title_length",
      category: "title",
      label: "Title length (40–70 chars)",
      status: "warn",
      score: 55,
      detail: `${titleLen} characters — may truncate on mobile.`,
      fix: "Cut filler words; put the hook in the first 50 characters.",
    });
  } else {
    items.push({
      id: "title_length",
      category: "title",
      label: "Title length (40–70 chars)",
      status: "fail",
      score: 25,
      detail: `${titleLen} characters — outside ideal range.`,
      fix: "Aim for 40–70 characters with a clear primary keyword.",
    });
  }

  // Title power / curiosity signals
  const powerWords =
    /\b(how|why|secret|best|vs|actually|mistakes|stop|never|ultimate|proven|free|new|202[4-9])\b/i;
  if (powerWords.test(title)) {
    items.push({
      id: "title_hook",
      category: "ctr",
      label: "Title hook / power words",
      status: "pass",
      score: 90,
      detail: "Title uses curiosity or authority language.",
    });
  } else {
    items.push({
      id: "title_hook",
      category: "ctr",
      label: "Title hook / power words",
      status: "warn",
      score: 50,
      detail: "Title is plain — limited emotional pull.",
      fix: "Add a concrete benefit, number, or tension (without clickbait lies).",
    });
  }

  // ALL CAPS spam
  const capsRatio =
    title.replace(/[^A-Za-z]/g, "").length === 0
      ? 0
      : (title.replace(/[^A-Z]/g, "").length /
          title.replace(/[^A-Za-z]/g, "").length) *
        100;
  if (capsRatio > 60 && title.replace(/[^A-Za-z]/g, "").length > 8) {
    items.push({
      id: "title_caps",
      category: "ctr",
      label: "Title casing",
      status: "fail",
      score: 30,
      detail: "Too much ALL CAPS — can look spammy.",
      fix: "Use Title Case; capitalize 1–2 key words only.",
    });
  } else {
    items.push({
      id: "title_caps",
      category: "ctr",
      label: "Title casing",
      status: "pass",
      score: 100,
      detail: "Casing looks natural.",
    });
  }

  // Description
  if (description.length >= 200) {
    items.push({
      id: "desc_length",
      category: "seo",
      label: "Description depth",
      status: "pass",
      score: 100,
      detail: `${description.length} chars — good for SEO + links.`,
    });
  } else if (description.length >= 80) {
    items.push({
      id: "desc_length",
      category: "seo",
      label: "Description depth",
      status: "warn",
      score: 55,
      detail: `${description.length} chars — thin for ranking.`,
      fix: "Add first 2–3 lines as a hook, then keywords, chapters, and CTAs.",
    });
  } else if (description.length > 0) {
    items.push({
      id: "desc_length",
      category: "seo",
      label: "Description depth",
      status: "fail",
      score: 25,
      detail: "Description is too short.",
      fix: "Write at least 150–300 characters with keywords in the first lines.",
    });
  } else {
    items.push({
      id: "desc_length",
      category: "seo",
      label: "Description depth",
      status: "fail",
      score: 0,
      detail: "No description provided.",
      fix: "Add a searchable description before upload.",
    });
  }

  // First line / timestamps hint
  if (description && /https?:\/\//i.test(description)) {
    items.push({
      id: "desc_links",
      category: "seo",
      label: "Description links / resources",
      status: "pass",
      score: 85,
      detail: "Includes a URL — good for CTAs.",
    });
  } else if (description.length >= 80) {
    items.push({
      id: "desc_links",
      category: "seo",
      label: "Description links / resources",
      status: "warn",
      score: 50,
      detail: "No links detected.",
      fix: "Add relevant resource, social, or affiliate link below the fold.",
    });
  }

  // Tags
  if (tags.length >= 8 && tags.length <= 25) {
    items.push({
      id: "tags_count",
      category: "seo",
      label: "Tags count (8–25)",
      status: "pass",
      score: 100,
      detail: `${tags.length} tags — solid coverage.`,
    });
  } else if (tags.length >= 3) {
    items.push({
      id: "tags_count",
      category: "seo",
      label: "Tags count (8–25)",
      status: "warn",
      score: 55,
      detail: `${tags.length} tags — add more related & long-tail tags.`,
      fix: "Mix 1–2 broad tags + several specific long-tail phrases.",
    });
  } else {
    items.push({
      id: "tags_count",
      category: "seo",
      label: "Tags count (8–25)",
      status: "fail",
      score: 15,
      detail: tags.length === 0 ? "No tags." : `Only ${tags.length} tag(s).`,
      fix: "Add 10–15 relevant tags matching search intent.",
    });
  }

  // Packaging toggles
  items.push({
    id: "thumbnail",
    category: "packaging",
    label: "Custom thumbnail ready",
    status: input.thumbnail_ready ? "pass" : "fail",
    score: input.thumbnail_ready ? 100 : 10,
    detail: input.thumbnail_ready
      ? "Thumbnail marked ready."
      : "No custom thumbnail flagged.",
    fix: input.thumbnail_ready
      ? undefined
      : "Design a high-contrast thumbnail before publish (ClickBoost helps).",
  });

  if (input.video_type !== "short") {
    items.push({
      id: "end_screen",
      category: "publish",
      label: "End screen planned",
      status: input.end_screen ? "pass" : "warn",
      score: input.end_screen ? 100 : 40,
      detail: input.end_screen
        ? "End screen set."
        : "End screen not set — miss subscribe/next video CTR.",
      fix: input.end_screen
        ? undefined
        : "Add end screen: subscribe + next video in last 5–20s.",
    });
    items.push({
      id: "cards",
      category: "publish",
      label: "Cards / info cards",
      status: input.cards ? "pass" : "warn",
      score: input.cards ? 100 : 45,
      detail: input.cards ? "Cards planned." : "No cards flagged.",
      fix: input.cards ? undefined : "Add cards for related videos or playlist.",
    });
    items.push({
      id: "chapters",
      category: "seo",
      label: "Chapters / timestamps",
      status: input.chapters ? "pass" : "warn",
      score: input.chapters ? 100 : 50,
      detail: input.chapters
        ? "Chapters planned — good for retention SEO."
        : "No chapters — harder to rank for key moments.",
      fix: input.chapters
        ? undefined
        : "Add 0:00 style timestamps in the description.",
    });
  }

  items.push({
    id: "playlist",
    category: "publish",
    label: "Playlist assignment",
    status: input.playlist ? "pass" : "warn",
    score: input.playlist ? 100 : 45,
    detail: input.playlist
      ? "Playlist ready."
      : "Not added to a playlist — weaker session watch.",
    fix: input.playlist
      ? undefined
      : "Add to a relevant series playlist before or right after upload.",
  });

  if (input.category?.trim()) {
    items.push({
      id: "category",
      category: "publish",
      label: "Category selected",
      status: "pass",
      score: 100,
      detail: `Category: ${input.category}`,
    });
  } else {
    items.push({
      id: "category",
      category: "publish",
      label: "Category selected",
      status: "warn",
      score: 50,
      detail: "Category not set.",
      fix: "Pick the closest YouTube category for better browse surfaces.",
    });
  }

  const overall_score = Math.round(
    items.reduce((sum, i) => sum + i.score, 0) / Math.max(items.length, 1)
  );
  const pass_count = items.filter((i) => i.status === "pass").length;
  const warn_count = items.filter((i) => i.status === "warn").length;
  const fail_count = items.filter((i) => i.status === "fail").length;

  return { items, overall_score, pass_count, warn_count, fail_count };
}
