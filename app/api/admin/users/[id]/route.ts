import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userIdToUpdate = params.id;
    if (!userIdToUpdate) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const body = await request.json();
    const { plan_type, is_banned, role } = body;

    const supabase = await createClient();

    // Check if requester is authenticated and is an admin
    const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser();
    if (authError || !currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', currentUser.id).single();
    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
    }

    // Build update object
    const updates: any = {};
    if (plan_type !== undefined) updates.plan_type = plan_type;
    if (is_banned !== undefined) updates.is_banned = is_banned;
    if (role !== undefined) updates.role = role;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    // Perform update
    const { data: updatedProfile, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", userIdToUpdate)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ user: updatedProfile });
  } catch (error: any) {
    console.error("Admin Users PATCH Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
