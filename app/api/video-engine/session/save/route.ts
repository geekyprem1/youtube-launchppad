import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logError } from "@/core/logger";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { session_id, step, data } = body;

    if (session_id) {
      // Update existing session
      const { error } = await supabase
        .from("video_engine_sessions")
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq("id", session_id)
        .eq("user_id", user.id);

      if (error) throw error;
      return NextResponse.json({ ok: true, session_id });
    } else {
      // Create new session
      const { data: session, error } = await supabase
        .from("video_engine_sessions")
        .insert({ user_id: user.id, ...data })
        .select("id")
        .single();

      if (error) throw error;
      return NextResponse.json({ ok: true, session_id: session.id });
    }
  } catch (err) {
    logError("VE_SESSION_SAVE", err);
    return NextResponse.json({ error: "Failed to save session" }, { status: 500 });
  }
}
