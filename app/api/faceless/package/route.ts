import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { denyUnlessFeature } from "@/lib/requireFeature";
import { processFacelessPackage } from "@/domains/faceless/service";
import { getTemplateById } from "@/domains/faceless/templates";
import { logError } from "@/core/logger";
import { z } from "zod";

export const maxDuration = 60;

const BodySchema = z.object({
  template_id: z.string().min(1),
  topic: z.string().min(3).max(300),
  video_type: z.enum(["long", "short"]).default("long"),
  extra_notes: z.string().max(500).optional().default(""),
});

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const denied = await denyUnlessFeature(user.id, "faceless_empire");
    if (denied) return denied;

    const body = await req.json();
    const parsed = BodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    if (!getTemplateById(parsed.data.template_id)) {
      return NextResponse.json({ error: "Unknown template" }, { status: 400 });
    }

    const result = await processFacelessPackage(parsed.data);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    logError("FacelessPackageAPI", err);
    return NextResponse.json(
      { error: "Failed to build faceless package" },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Public list of templates (still requires auth via dashboard; no secrets)
  const { FACELESS_TEMPLATES } = await import("@/domains/faceless/templates");
  return NextResponse.json({
    ok: true,
    templates: FACELESS_TEMPLATES.map((t) => ({
      id: t.id,
      name: t.name,
      niche: t.niche,
      style: t.style,
      format: t.format,
      tone: t.tone,
      description: t.description,
      sample_topics: t.sample_topics,
      visual_style: t.visual_style,
      voice_style: t.voice_style,
      thumbnail_formula: t.thumbnail_formula,
    })),
  });
}
