import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const DEFAULT_METRICS = {
  mission: {
    title: "Publish one high-opportunity tutorial",
    description: "Based on your AI Memory, tutorials outperform your other content by 41%. Competition is low today.",
    progress: 50,
    tasks: [
      { label: "Topic selected", done: true },
      { label: "Title optimized", done: true },
      { label: "Thumbnail generated", done: false },
      { label: "Scheduled", done: false }
    ]
  },
  briefings: [
    { type: "competitor", title: "Competitor Alert", message: "MrBeast uploaded 2 hrs ago. High threat to your current niche.", color: "red" },
    { type: "trend", title: "Trend Exploding", message: "\"AI Agents\" search volume up 312% in the last 24h.", color: "green" },
    { type: "growth", title: "Yesterday's Growth", message: "+420 Subs, but CTR dropped by 8% overall.", color: "purple" }
  ],
  health: {
    overall: 88,
    metrics: [
      { label: "Idea Quality", score: 92 },
      { label: "Consistency", score: 84 },
      { label: "SEO & Discovery", score: 71 },
      { label: "Packaging", score: 89 },
      { label: "Audience Match", score: 94 }
    ],
    advice: "Your SEO score is dragging down your overall health. Run a channel audit to fix missing tags."
  },
  timeline: [
    { month: "April", title: "Subs Accelerated", color: "blue", active: true },
    { month: "March", title: "Views Doubled", color: "gray", active: true },
    { month: "February", title: "Retention Improved", color: "gray", active: true }
  ]
};

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: existingMetrics, error } = await supabase
      .from("dashboard_metrics")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (existingMetrics) {
      return NextResponse.json(existingMetrics);
    }

    // Seed if none exist
    const { data: newMetrics, error: insertError } = await supabase
      .from("dashboard_metrics")
      .insert({
        user_id: user.id,
        mission: DEFAULT_METRICS.mission,
        briefings: DEFAULT_METRICS.briefings,
        health: DEFAULT_METRICS.health,
        timeline: DEFAULT_METRICS.timeline,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error seeding dashboard metrics:", insertError);
      return NextResponse.json({ error: "Failed to initialize metrics" }, { status: 500 });
    }

    return NextResponse.json(newMetrics);
  } catch (err) {
    console.error("Dashboard API Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
