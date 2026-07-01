import { NextResponse } from "next/server";

export const maxDuration = 60; // Vercel: extend timeout to 60s (free tier max)
import { createClient } from "@/lib/supabase/server";
import { callAI } from "@/lib/openrouter";
import { ToolkitResponseSchema } from "@/domains/toolkit-engine/types";
import { checkLimit, incrementUsage } from "@/lib/planLimits";
import { UPGRADE_MESSAGES } from "@/lib/plans";

const generateSchemaStructure = `
{
  "titles": [
    { "text": "", "ctr_score": 0, "seo_score": 0, "viral_score": 0, "is_best": false }
  ],
  "description": "",
  "keywords": {
    "primary": [""],
    "secondary": [""],
    "long_tail": [""]
  },
  "tags": [""],
  "hashtags": {
    "primary": [""],
    "secondary": [""],
    "trending": [""]
  }
}
`;

/** Strip markdown code fences that some models add around JSON */
function cleanJSON(raw: string): string {
  return raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/, "")
    .trim();
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { videoType, topic } = body;

    if (!videoType || !topic || typeof topic !== "string") {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const safeTopic = topic.slice(0, 150).replace(/[<>]/g, "");

    // Check plan limits
    try {
      const limit = await checkLimit(user.id, "ideas_per_day");
      if (!limit.allowed) {
        return NextResponse.json({
          error: UPGRADE_MESSAGES.ideas_per_day, limitReached: true,
          used: limit.used, limit: limit.limit, plan: limit.plan,
        }, { status: 429 });
      }
    } catch (limitErr) {
      console.error("[Toolkit] checkLimit failed (non-fatal):", limitErr);
    }

    let optimizationFocus = "";
    if (videoType === "long") {
      optimizationFocus = `
      Focus heavily on:
      - Search intent and evergreen ranking
      - Higher watch time
      - Detailed descriptions with chapters placeholder and link placeholders
      - Long-form keyword strategy
      - Titles that combine high CTR with strong SEO keywords
      `;
    } else if (videoType === "shorts") {
      optimizationFocus = `
      Focus heavily on:
      - Viral potential and high CTR
      - Fast engagement and trending language
      - Shorts algorithm optimization
      - Very short, snappy description with a quick CTA
      - Trending and viral hashtags
      - High-click, punchy titles that provoke curiosity
      `;
    }

    const systemPrompt = `You are the YT Launchpad Toolkit Engine — an expert YouTube strategist who writes like a real, successful creator.
    Your task is to generate all essential YouTube publishing assets optimized for a ${videoType === "long" ? "Long-form Video" : "YouTube Short"}.
    
    ${optimizationFocus}
    
    HUMAN WRITING RULES (apply to ALL text you generate):
    - Write like a TOP YouTuber, not like an AI assistant or marketing agency
    - Use contractions naturally: "you're", "it's", "here's", "don't", "I've"
    - Be SPECIFIC to the topic — no generic content that could apply to any video
    - Vary sentence length: Short. Punchy. Direct. Then a longer one with more detail.
    
    BANNED WORDS & PHRASES (never use):
    - "Delve", "dive deep", "let's dive in", "comprehensive", "multifaceted"
    - "In today's digital landscape", "game-changer", "revolutionary", "transformative"
    - "Unlock the power of", "take your X to the next level", "leverage"
    - "The ultimate guide to", "everything you need to know about"
    - Any title or description that sounds like a template or corporate copy
    
    TITLE RULES:
    - Titles must be specific, punchy, and clickable without being clickbait
    - Use real numbers, personal angles, or bold claims when relevant
    BAD: "A Comprehensive Guide to [Topic]: Everything You Need to Know"
    GOOD: "I Tried This for 30 Days. Here's What Actually Happened."
    BAD: "Unlocking the Power of [Topic] in Today's Digital Age"
    GOOD: "The One Mistake That's Quietly Killing Your [Topic]"
    
    CRITICAL RULES:
    - You MUST generate EXACTLY 5 titles. No more, no less.
    - Mark exactly ONE title as "is_best": true.
    - All scores (ctr_score, seo_score, viral_score) must be integers between 0 and 100.
    - Return ONLY valid JSON. No markdown, no code fences, no explanation.
    
    Required JSON structure:
    ${generateSchemaStructure}
    `;

    const userPrompt = `Generate the publishing toolkit for this video topic:
    <user_input>${safeTopic}</user_input>`;

    const rawContent = await callAI(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      { model: process.env.OPENROUTER_PRO_MODEL || "google/gemini-2.5-flash", json: true, max_tokens: 2500 }
    );

    if (!rawContent) throw new Error("Empty response from AI");

    // Clean markdown fences if model added them
    const cleaned = cleanJSON(rawContent);

    let rawData: any;
    try {
      rawData = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error("[Toolkit] JSON parse failed. Raw content:", rawContent);
      throw new Error("AI returned invalid JSON");
    }

    // Validate with Zod — use safeParse so we get a real error message
    const validation = ToolkitResponseSchema.safeParse(rawData);
    if (!validation.success) {
      console.error("[Toolkit] Zod validation failed:", validation.error.format());
      // Try to recover: if titles count is wrong, trim or pad
      if (rawData.titles && Array.isArray(rawData.titles)) {
        // Trim to 5 if more
        if (rawData.titles.length > 5) rawData.titles = rawData.titles.slice(0, 5);
        // If less than 5, pad with last item copies
        while (rawData.titles.length < 5) {
          rawData.titles.push({ ...rawData.titles[rawData.titles.length - 1], is_best: false });
        }
        // Ensure exactly one is_best
        const hasBest = rawData.titles.some((t: any) => t.is_best === true);
        if (!hasBest) rawData.titles[0].is_best = true;
      }
      
      // Re-validate after recovery
      const recovery = ToolkitResponseSchema.safeParse(rawData);
      if (!recovery.success) {
        throw new Error("AI response structure is invalid even after recovery");
      }
      rawData = recovery.data;
    } else {
      rawData = validation.data;
    }

    // Increment usage (non-fatal)
    try {
      await incrementUsage(user.id, "ideas_per_day");
    } catch (usageErr) {
      console.error("[Toolkit] incrementUsage failed (non-fatal):", usageErr);
    }

    // Save to DB (non-fatal)
    let historyId: string | undefined;
    try {
      const { data: savedData, error: dbError } = await supabase
        .from("toolkit_engine_history")
        .insert({
          user_id: user.id,
          video_type: videoType,
          topic: topic,
          titles: rawData.titles,
          description: rawData.description,
          keywords: rawData.keywords,
          tags: rawData.tags,
          hashtags: rawData.hashtags,
        })
        .select("id")
        .single();

      if (dbError) console.error("[Toolkit] DB save failed (non-fatal):", dbError);
      else historyId = savedData?.id;
    } catch (dbErr) {
      console.error("[Toolkit] DB save threw (non-fatal):", dbErr);
    }

    return NextResponse.json({ ...rawData, historyId });

  } catch (error: any) {
    console.error("[Toolkit] Fatal error:", error.message, error.stack);
    return NextResponse.json(
      { error: "Failed to generate toolkit", details: error.message },
      { status: 500 }
    );
  }
}
