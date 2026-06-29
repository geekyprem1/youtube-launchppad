"use client";

import { useState, useEffect } from "react";
import { Ban, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { PLANS } from "@/lib/plans";

export function UsersTable() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch users");
      setUsers(data.users || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function updateUser(id: string, updates: any) {
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update user");
      
      // Update local state
      setUsers(users.map(u => u.id === id ? { ...u, ...updates } : u));
    } catch (err: any) {
      alert(err.message);
    }
  }

  if (loading) return <div className="p-8 text-sm text-gray-500 text-center">Loading users...</div>;
  if (error) return <div className="p-8 text-sm text-red-500 text-center">Error: {error}</div>;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50/50 text-xs text-gray-500 font-medium border-b border-gray-200 uppercase">
            <tr>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Plan</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                      {user.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{user.full_name || 'No Name'}</div>
                      <div className="text-gray-500 text-xs">{user.email}</div>
                      <div className="text-gray-400 text-[10px] mt-0.5">ID: {user.id.substring(0,8)}...</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <select 
                    value={user.plan_type || 'free'}
                    onChange={(e) => updateUser(user.id, { plan_type: e.target.value })}
                    className="text-xs border-gray-200 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white py-1.5 px-3 pr-8"
                  >
                    {Object.keys(PLANS).map(plan => (
                      <option key={plan} value={plan}>{PLANS[plan as keyof typeof PLANS].name}</option>
                    ))}
                  </select>
                </td>
                <td className="px-6 py-4">
                  <select 
                    value={user.role || 'user'}
                    onChange={(e) => updateUser(user.id, { role: e.target.value })}
                    className={cn(
                      "text-xs border-gray-200 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 py-1.5 px-3 pr-8",
                      user.role === 'admin' ? 'bg-red-50 text-red-700 font-medium border-red-200' : 'bg-white'
                    )}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="px-6 py-4">
                  <span className={cn(
                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                    user.is_banned ? "bg-red-100 text-red-700 border border-red-200" : "bg-green-100 text-green-700 border border-green-200"
                  )}>
                    {user.is_banned ? <Ban className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                    {user.is_banned ? "Banned" : "Active"}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => updateUser(user.id, { is_banned: !user.is_banned })}
                    className={cn(
                      "text-xs px-4 py-2 rounded-lg font-medium transition-colors shadow-sm",
                      user.is_banned 
                        ? "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50" 
                        : "bg-red-50 border border-red-200 text-red-600 hover:bg-red-100"
                    )}
                  >
                    {user.is_banned ? "Unban User" : "Ban User"}
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500 text-sm">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
