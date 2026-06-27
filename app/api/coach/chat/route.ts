import { NextRequest, NextResponse } from "next/server";
import { processCoachChat } from "@/domains/coach/service";
import { CoachRequestSchema } from "@/domains/coach/types";
import { createClient } from "@/lib/supabase/server";
import { logError } from "@/core/logger";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // In a real app we'd require auth, but for MVP we might allow anonymous if needed.
    // We will use user.id if present, else 'anonymous'
    const userId = user?.id || "anonymous";

    const body = await req.json();
    const parsedRequest = CoachRequestSchema.safeParse(body);
    
    if (!parsedRequest.success) {
      return NextResponse.json({ error: "Invalid request payload", details: parsedRequest.error }, { status: 400 });
    }

    // Process using the Domain Service Orchestrator
    const result = await processCoachChat(userId, parsedRequest.data);

    // Save chat interaction to DB
    if (user) {
      await supabase.from("coach_chats").insert({
        user_id: user.id,
        message: parsedRequest.data.messages[parsedRequest.data.messages.length - 1],
        results: result,
      });
    }

    return NextResponse.json(result);
  } catch (err) {
    logError("CoachAPI", err);
    return NextResponse.json({ error: "Failed to process chat" }, { status: 500 });
  }
}
