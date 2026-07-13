"use client";

import { useState, useEffect } from "react";
import { Ban, CheckCircle, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { PLANS, type PlanType } from "@/lib/plans";
import { OTO_CATALOG, type OtoId } from "@/lib/features";

type AdminUser = {
  id: string;
  email?: string | null;
  full_name?: string | null;
  plan_type?: string | null;
  role?: string | null;
  is_banned?: boolean | null;
  unlocked_otos?: string[] | null;
  video_engine_credits?: number | null;
};

export function UsersTable() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedOtos, setExpandedOtos] = useState<Record<string, boolean>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

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

  async function updateUser(id: string, updates: Record<string, unknown>) {
    setSavingId(id);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update user");

      // Prefer server row so credits / normalized OTOs stay in sync
      setUsers((prev) =>
        prev.map((u) =>
          u.id === id ? { ...u, ...updates, ...(data.user || {}) } : u
        )
      );
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSavingId(null);
    }
  }

  function toggleOto(user: AdminUser, otoId: OtoId) {
    const current = Array.isArray(user.unlocked_otos)
      ? user.unlocked_otos.map((o) => o.toLowerCase())
      : [];
    const has = current.includes(otoId);
    const next = has
      ? current.filter((id) => id !== otoId)
      : [...current, otoId];
    updateUser(user.id, { unlocked_otos: next });
  }

  if (loading) {
    return (
      <div className="p-8 text-sm text-gray-500 text-center">Loading users...</div>
    );
  }
  if (error) {
    return (
      <div className="p-8 text-sm text-red-500 text-center">Error: {error}</div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="px-6 py-3 border-b border-gray-100 bg-gray-50/50 text-xs text-gray-500">
        Set <strong className="text-gray-700">FE</strong> after LaunchPadJV
        payment · Tick OTOs to unlock modules · FE grant seeds credits to 100 if
        lower
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50/50 text-xs text-gray-500 font-medium border-b border-gray-200 uppercase">
            <tr>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Plan</th>
              <th className="px-6 py-4 min-w-[220px]">OTOs</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((user) => {
              const unlocked = Array.isArray(user.unlocked_otos)
                ? user.unlocked_otos.map((o) => o.toLowerCase())
                : [];
              const isExpanded = !!expandedOtos[user.id];
              const isSaving = savingId === user.id;

              return (
                <tr
                  key={user.id}
                  className={cn(
                    "hover:bg-gray-50/50 transition-colors align-top",
                    isSaving && "opacity-70"
                  )}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold shrink-0">
                        {user.full_name?.[0]?.toUpperCase() ||
                          user.email?.[0]?.toUpperCase() ||
                          "?"}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {user.full_name || "No Name"}
                        </div>
                        <div className="text-gray-500 text-xs">{user.email}</div>
                        <div className="text-gray-400 text-[10px] mt-0.5">
                          ID: {user.id.substring(0, 8)}...
                          {typeof user.video_engine_credits === "number" && (
                            <span className="ml-2 text-emerald-600">
                              · {user.video_engine_credits} VE credits
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <select
                      value={user.plan_type || "free"}
                      disabled={isSaving}
                      onChange={(e) =>
                        updateUser(user.id, { plan_type: e.target.value })
                      }
                      className="text-xs border-gray-200 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white py-1.5 px-3 pr-8"
                    >
                      {(Object.keys(PLANS) as PlanType[]).map((plan) => (
                        <option key={plan} value={plan}>
                          {PLANS[plan].name}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      <button
                        type="button"
                        disabled={isSaving}
                        onClick={() =>
                          setExpandedOtos((prev) => ({
                            ...prev,
                            [user.id]: !prev[user.id],
                          }))
                        }
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-lg px-2.5 py-1.5 hover:bg-indigo-100 transition-colors"
                      >
                        {unlocked.length === 0
                          ? "No OTOs"
                          : `${unlocked.length} OTO${unlocked.length === 1 ? "" : "s"}`}
                        {unlocked.includes("oto12") && (
                          <span className="text-[10px] uppercase bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-bold">
                            Infinity
                          </span>
                        )}
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {unlocked.length > 0 && !isExpanded && (
                        <div className="flex flex-wrap gap-1">
                          {unlocked.map((id) => (
                            <span
                              key={id}
                              className="text-[10px] font-medium bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded"
                            >
                              {id}
                            </span>
                          ))}
                        </div>
                      )}

                      {isExpanded && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 p-2 rounded-lg border border-gray-200 bg-gray-50 max-w-md">
                          {OTO_CATALOG.map((oto) => {
                            const checked = unlocked.includes(oto.id);
                            return (
                              <label
                                key={oto.id}
                                className={cn(
                                  "flex items-start gap-2 text-xs cursor-pointer rounded-md px-2 py-1.5 hover:bg-white transition-colors",
                                  checked && "bg-white border border-indigo-100"
                                )}
                              >
                                <input
                                  type="checkbox"
                                  className="mt-0.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                  checked={checked}
                                  disabled={isSaving}
                                  onChange={() => toggleOto(user, oto.id)}
                                />
                                <span>
                                  <span className="font-semibold text-gray-800">
                                    {oto.id}
                                  </span>
                                  <span className="text-gray-500">
                                    {" "}
                                    · {oto.name}
                                  </span>
                                  <span className="block text-[10px] text-gray-400">
                                    ${oto.price}
                                    {oto.unlocks === "all"
                                      ? " · all features"
                                      : ""}
                                  </span>
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <select
                      value={user.role || "user"}
                      disabled={isSaving}
                      onChange={(e) =>
                        updateUser(user.id, { role: e.target.value })
                      }
                      className={cn(
                        "text-xs border-gray-200 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 py-1.5 px-3 pr-8",
                        user.role === "admin"
                          ? "bg-red-50 text-red-700 font-medium border-red-200"
                          : "bg-white"
                      )}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                        user.is_banned
                          ? "bg-red-100 text-red-700 border border-red-200"
                          : "bg-green-100 text-green-700 border border-green-200"
                      )}
                    >
                      {user.is_banned ? (
                        <Ban className="w-3 h-3" />
                      ) : (
                        <CheckCircle className="w-3 h-3" />
                      )}
                      {user.is_banned ? "Banned" : "Active"}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={() =>
                        updateUser(user.id, { is_banned: !user.is_banned })
                      }
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
              );
            })}
            {users.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-8 text-center text-gray-500 text-sm"
                >
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
