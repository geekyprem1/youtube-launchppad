import { NextResponse } from "next/server";

export const maxDuration = 60; // Vercel: extend timeout to 60s (free tier max)
import { createClient } from "@/lib/supabase/server";
import { callAI } from "@/lib/openrouter";
import { 
  ToolkitTitleSchema, 
  ToolkitHashtagsSchema, 
  ToolkitKeywordsSchema 
} from "@/domains/toolkit-engine/types";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { section, videoType, topic } = body;

    if (!section || !videoType || !topic) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    let optimizationFocus = "";
    if (videoType === "long") {
      optimizationFocus = "Focus heavily on: Search intent and evergreen ranking, Higher watch time, Long-form keyword strategy.";
    } else {
      optimizationFocus = "Focus heavily on: Viral potential and high CTR, Fast engagement and trending language, Shorts algorithm optimization.";
    }

    let systemPrompt = "";
    let expectedSchema = "";
    let ZodSchema: any;

    if (section === "titles") {
      expectedSchema = `[ { "text": "", "ctr_score": 0, "seo_score": 0, "viral_score": 0, "is_best": false } ]`;
      systemPrompt = `You are the Tubora Toolkit Engine AI. Generate 5 new unique alternative titles for a ${videoType} video about: "${topic}".\n${optimizationFocus}\nMark exactly ONE as is_best: true.`;
      ZodSchema = z.array(ToolkitTitleSchema).length(5);
    } 
    else if (section === "description") {
      expectedSchema = `{ "description": "" }`;
      systemPrompt = `You are the Tubora Toolkit Engine AI. Generate a new highly optimized description for a ${videoType} video about: "${topic}".\n${optimizationFocus}`;
      ZodSchema = z.object({ description: z.string() });
    }
    else if (section === "keywords") {
      expectedSchema = `{ "primary": [""], "secondary": [""], "long_tail": [""] }`;
      systemPrompt = `You are the Tubora Toolkit Engine AI. Generate a new set of SEO keywords for a ${videoType} video about: "${topic}".\n${optimizationFocus}`;
      ZodSchema = ToolkitKeywordsSchema;
    }
    else if (section === "tags") {
      expectedSchema = `[ "tag1", "tag2" ]`;
      systemPrompt = `You are the Tubora Toolkit Engine AI. Generate a new list of 15 optimized YouTube Tags for a ${videoType} video about: "${topic}".\n${optimizationFocus}`;
      ZodSchema = z.array(z.string());
    }
    else if (section === "hashtags") {
      expectedSchema = `{ "primary": [""], "secondary": [""], "trending": [""] }`;
      systemPrompt = `You are the Tubora Toolkit Engine AI. Generate new hashtags for a ${videoType} video about: "${topic}".\n${optimizationFocus}`;
      ZodSchema = ToolkitHashtagsSchema;
    }
    else {
      return NextResponse.json({ error: "Invalid section" }, { status: 400 });
    }

    const fullPrompt = `${systemPrompt}\n\nYou MUST return ONLY valid JSON matching this exact structure:\n${expectedSchema}`;

    const content = await callAI(
      [
        { role: "system", content: fullPrompt }
      ],
      { model: process.env.OPENROUTER_PRO_MODEL || "google/gemini-2.5-flash", json: true, max_tokens: 1500 }
    );

    if (!content) throw new Error("Empty response from AI");

    const rawData = JSON.parse(content);
    const result = ZodSchema.parse(rawData);

    return NextResponse.json({ result });

  } catch (error: any) {
    console.error("Toolkit Regenerate API Error:", error);
    return NextResponse.json(
      { error: "Failed to regenerate section", details: error.message },
      { status: 500 }
    );
  }
}
