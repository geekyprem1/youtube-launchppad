import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { callAI } from "@/lib/openrouter";
import { ChannelReportSchema } from "@/domains/channel-engine/types";
import { z } from "zod";

// Prompt to instruct AI to generate a highly realistic simulated audit.
const SYSTEM_PROMPT = `You are the Tubora Channel Engine AI, an expert YouTube growth strategist and analyst.
Your task is to generate a comprehensive, highly realistic Channel Audit for a YouTube channel based on its URL or Handle.

Since you may not have real-time API access to their channel, you must perform an "AI Smart Audit" (Estimated).
Use your vast knowledge of YouTube best practices, recognizable niches, and common creator patterns to synthesize a highly actionable, realistic report. 

If you recognize the channel handle (e.g., @MrBeast, @AliAbdaal), use your training data to make the audit highly accurate to their actual style.
If it is an unknown channel, deduce the niche from the handle/URL, and generate a plausible, highly constructive audit that a creator in that niche would find immensely valuable.

Return the result as a strict JSON object matching the provided schema.
Ensure that:
1. 'analysis_type' is exactly "ai_smart".
2. All scorecards have scores between 0 and 100 with a constructive reason.
3. The Action Plan is divided into High, Medium, Low priorities.
4. The Overall Score is a realistic weighted average of the scorecards.
`;

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { channelUrl } = body;

    if (!channelUrl || typeof channelUrl !== "string") {
      return NextResponse.json({ error: "Missing or invalid channelUrl" }, { status: 400 });
    }

    const expectedSchema = `
{
  "overall_score": 0,
  "analysis_type": "ai_smart",
  "overview": { "channel_name": "", "niche": "", "primary_content_type": "", "upload_frequency": "", "estimated_target_audience": "", "growth_stage": "" },
  "scorecards": {
    "branding": { "score": 0, "label": "", "reason": "" },
    "channel_seo": { "score": 0, "label": "", "reason": "" },
    "thumbnail_quality": { "score": 0, "label": "", "reason": "" },
    "title_quality": { "score": 0, "label": "", "reason": "" },
    "hook_strength": { "score": 0, "label": "", "reason": "" },
    "description_optimization": { "score": 0, "label": "", "reason": "" },
    "keyword_usage": { "score": 0, "label": "", "reason": "" },
    "tags": { "score": 0, "label": "", "reason": "" },
    "playlists": { "score": 0, "label": "", "reason": "" },
    "upload_consistency": { "score": 0, "label": "", "reason": "" },
    "audience_targeting": { "score": 0, "label": "", "reason": "" },
    "video_structure": { "score": 0, "label": "", "reason": "" },
    "viewer_retention_potential": { "score": 0, "label": "", "reason": "" },
    "ctr_potential": { "score": 0, "label": "", "reason": "" },
    "engagement_optimization": { "score": 0, "label": "", "reason": "" },
    "monetization_readiness": { "score": 0, "label": "", "reason": "" },
    "viral_potential": { "score": 0, "label": "", "reason": "" }
  },
  "findings": {
    "what_is_working": [""],
    "growth_blockers": [""],
    "critical_mistakes": [""],
    "missed_opportunities": [""]
  },
  "strategy": {
    "action_plan": [
      { "title": "", "description": "", "impact": "High" }
    ],
    "quick_wins": [""],
    "long_term": {
      "days_30": [""],
      "days_90": [""],
      "months_6": [""]
    }
  }
}
`;
    const prompt = `Analyze this YouTube channel and generate the full audit report: ${channelUrl}\n\nYou MUST return ONLY valid JSON matching this exact structure:\n${expectedSchema}`;

    // Call the LLM
    const content = await callAI(
      [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt }
      ],
      { model: "google/gemini-2.5-pro", json: true, max_tokens: 8192 }
    );

    if (!content) throw new Error("Empty response from AI");

    const rawData = JSON.parse(content);
    
    // Validate output with Zod
    const report = ChannelReportSchema.parse(rawData);

    // Save to DB
    const { data: savedAudit, error: dbError } = await supabase
      .from("channel_engine_audits")
      .insert({
        user_id: user.id,
        channel_url: channelUrl,
        channel_name: report.overview.channel_name,
        overall_score: report.overall_score,
        analysis_type: report.analysis_type,
        report: report
      })
      .select()
      .single();

    if (dbError) {
      console.error("Failed to save audit to DB:", dbError);
      // We can still return the report even if saving fails, but ideally we should log it.
    }

    return NextResponse.json({ data: report, auditId: savedAudit?.id });

  } catch (error: any) {
    console.error("Channel Engine Analysis Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate channel analysis." },
      { status: 500 }
    );
  }
}
