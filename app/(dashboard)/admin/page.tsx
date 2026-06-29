import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { UsersTable } from "@/components/admin/UsersTable";
import { Shield } from "lucide-react";

export const metadata = {
  title: "Admin Panel | CreatorOS AI",
};

export default async function AdminPage() {
  const supabase = await createClient();

  // Check auth and role
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect("/login");
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') {
    // Redirect non-admins to dashboard
    redirect("/dashboard");
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50/50 h-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-600">
                <Shield className="w-5 h-5" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Admin Dashboard</h1>
            </div>
            <p className="mt-2 text-sm text-gray-500 max-w-2xl">
              Manage users, their subscription plans, and platform access. 
              Only users with the 'admin' role can view this page.
            </p>
          </div>
        </div>

        <div className="grid gap-6">
          <UsersTable />
        </div>
      </div>
    </div>
  );
}
