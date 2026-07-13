import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { denyUnlessFeature } from "@/lib/requireFeature";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const denied = await denyUnlessFeature(user.id, "clickbait");
    if (denied) return denied;

  const { data, error } = await supabase
    .from("clickbait_thumbnail_history")
    .select("id, video_type, topic, clickbait_prompt, image_url, image_size, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    return NextResponse.json({ error: "Failed to load history" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, data });
}
