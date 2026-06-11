"use client";
import { useEffect, useState } from "react";

interface User {
  id: number; username: string; role: string; status: string;
  permissions: string; createdAt: string;
}

const ALL_PAGES = [
  { path: "/stats",     label: "🟠 Orange Cap" },
  { path: "/bowling",   label: "🟣 Purple Cap" },
  { path: "/mvp",       label: "🏆 MVP" },
  { path: "/explosive", label: "💥 Explosive" },
  { path: "/matches",   label: "📋 Matches" },
  { path: "/profiles",  label: "📊 Profiles" },
  { path: "/players",   label: "👤 Players" },
];

const DEFAULT_PERMISSIONS = ["/stats", "/bowling", "/mvp", "/explosive", "/profiles"];

const statusBadge: Record<string, string> = {
  pending:  "bg-yellow-500/15 text-yellow-300 border-yellow-500/25",
  approved: "bg-green-500/15 text-green-300 border-green-500/25",
  rejected: "bg-red-500/15 text-red-400 border-red-500/25",
};
const roleBadge: Record<string, string> = {
  admin: "bg-orange-500/15 text-orange-300 border-orange-500/25",
  user:  "bg-white/8 text-gray-400 border-white/10",
};

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [saving, setSaving] = useState<number | null>(null);
  const [resetting, setResetting] = useState<number | null>(null);
  const [newPwd, setNewPwd] = useState<Record<number, string>>({});

  async function load() {
    const res = await fetch("/api/admin/users");
    if (res.ok) setUsers(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function update(id: number, data: object) {
    setSaving(id);
    await fetch(`/api/admin/users/${id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
    });
    await load();
    setSaving(null);
  }

  async function deleteUser(id: number, username: string) {
    if (!confirm(`Delete user "${username}"? This cannot be undone.`)) return;
    await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    setUsers((prev) => prev.filter((u) => u.id !== id));
  }

  function togglePermission(user: User, path: string) {
    const perms: string[] = JSON.parse(user.permissions || "[]");
    const next = perms.includes(path) ? perms.filter((p) => p !== path) : [...perms, path];
    update(user.id, { permissions: next });
  }

  function setAllPermissions(user: User, all: boolean) {
    update(user.id, { permissions: all ? ["*"] : [] });
  }

  async function resetPassword(user: User) {
    const pwd = newPwd[user.id]?.trim();
    if (!pwd || pwd.length < 6) return;
    setResetting(user.id);
    await fetch(`/api/admin/users/${user.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newPassword: pwd }),
    });
    setNewPwd((prev) => ({ ...prev, [user.id]: "" }));
    setResetting(null);
  }

  const pending  = users.filter((u) => u.status === "pending");
  const approved = users.filter((u) => u.status === "approved");
  const rejected = users.filter((u) => u.status === "rejected");

  return (
    <div className="relative -mt-6 -mx-4 px-4 pt-0 overflow-hidden">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-[400px] h-[400px] rounded-full bg-orange-600/10 blur-[100px]" />
        <div className="absolute top-60 -left-20 w-[300px] h-[300px] rounded-full bg-red-600/8 blur-[80px]" />
      </div>

      {/* Header */}
      <div className="relative pt-10 pb-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <p className="text-xs uppercase tracking-[0.25em] text-orange-400 font-bold mb-1">Admin</p>
            <h1 className="text-[5rem] sm:text-[7rem] leading-none bg-gradient-to-br from-orange-300 via-orange-400 to-red-400 bg-clip-text text-transparent"
              style={{ fontFamily: "var(--font-bebas)", letterSpacing: "0.05em", lineHeight: 1 }}>
              User<br /><span className="text-white">Management</span>
            </h1>
            <p className="text-gray-500 mt-2 text-sm" style={{ fontFamily: "var(--font-rajdhani)", fontWeight: 600 }}>
              Approve users · Manage roles · Set page permissions
            </p>
          </div>
          <div className="text-[7rem] sm:text-[9rem] leading-none select-none shrink-0 self-center opacity-35">
            ⚙️
          </div>
        </div>
        <div className="mt-6 h-px bg-gradient-to-r from-orange-500/50 via-orange-500/20 to-transparent" />
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-600"><div className="text-4xl mb-3 animate-pulse">⚙️</div><p>Loading users…</p></div>
      ) : (
        <div className="relative space-y-8 pb-10">

          {/* ── Pending approvals ── */}
          {pending.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-yellow-400 text-sm font-black uppercase tracking-widest">⏳ Pending Approval</span>
                <span className="px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300 text-xs font-bold">{pending.length}</span>
              </div>
              <div className="space-y-2">
                {pending.map((u) => (
                  <div key={u.id} className="flex items-center gap-4 px-5 py-4 rounded-2xl border border-yellow-500/20 bg-yellow-500/5">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-600 to-amber-700 flex items-center justify-center font-black text-white shrink-0"
                      style={{ fontFamily: "var(--font-bebas)" }}>{u.username[0].toUpperCase()}</div>
                    <div className="flex-1">
                      <p className="font-black text-white" style={{ fontFamily: "var(--font-rajdhani)" }}>{u.username}</p>
                      <p className="text-xs text-gray-600">{new Date(u.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-2">
                      <button disabled={saving === u.id} onClick={() => {
                          const current: string[] = JSON.parse(u.permissions || "[]");
                          const merged = Array.from(new Set([...current, ...DEFAULT_PERMISSIONS]));
                          update(u.id, { status: "approved", permissions: merged });
                        }}
                        className="px-4 py-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-[0_0_14px_rgba(22,163,74,0.3)]">
                        Approve
                      </button>
                      <button disabled={saving === u.id} onClick={() => update(u.id, { status: "rejected" })}
                        className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/25 text-red-400 text-xs font-bold rounded-xl transition-all">
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── Active users ── */}
          <section>
            <p className="text-xs font-black uppercase tracking-widest text-gray-500 mb-3">
              ✅ Active Users ({approved.length})
            </p>
            <div className="space-y-2">
              {approved.map((u) => {
                const perms: string[] = JSON.parse(u.permissions || "[]");
                const isAllAccess = perms.includes("*");
                const isOpen = expanded === u.id;
                return (
                  <div key={u.id} className={`rounded-2xl border overflow-hidden transition-all ${isOpen ? "border-white/15 bg-white/[0.03]" : "border-white/8 bg-white/[0.02]"}`}>
                    <div className="flex items-center gap-4 px-5 py-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center font-black text-white shrink-0"
                        style={{ fontFamily: "var(--font-bebas)" }}>{u.username[0].toUpperCase()}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-black text-white" style={{ fontFamily: "var(--font-rajdhani)" }}>{u.username}</p>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase ${roleBadge[u.role]}`}>{u.role}</span>
                          {isAllAccess && <span className="text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase bg-blue-500/15 text-blue-300 border-blue-500/25">All Access</span>}
                        </div>
                        <p className="text-xs text-gray-600 mt-0.5">
                          {isAllAccess ? "Full access" : `${perms.length} page${perms.length !== 1 ? "s" : ""}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => update(u.id, { role: u.role === "admin" ? "user" : "admin" })}
                          disabled={saving === u.id}
                          className="px-3 py-1.5 text-xs font-bold rounded-lg border transition-all disabled:opacity-40 bg-white/5 border-white/10 hover:bg-white/10 text-gray-400 hover:text-white">
                          {u.role === "admin" ? "Demote" : "Make Admin"}
                        </button>
                        <button onClick={() => setExpanded(isOpen ? null : u.id)}
                          className="px-3 py-1.5 text-xs font-bold rounded-lg border bg-white/5 border-white/10 hover:bg-white/10 text-gray-400 hover:text-white transition-all">
                          Permissions {isOpen ? "▲" : "▼"}
                        </button>
                        <button onClick={() => deleteUser(u.id, u.username)}
                          className="px-3 py-1.5 text-xs font-bold rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/15 text-red-400 hover:text-red-300 transition-all">
                          Delete
                        </button>
                      </div>
                    </div>

                    {/* Permissions panel */}
                    {isOpen && (
                      <div className="border-t border-white/8 px-5 py-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Page Access</p>
                          <div className="flex gap-2">
                            <button onClick={() => setAllPermissions(u, true)} disabled={saving === u.id}
                              className="text-xs px-3 py-1 rounded-lg bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 border border-blue-500/20 font-semibold transition-all disabled:opacity-40">
                              Grant All
                            </button>
                            <button onClick={() => setAllPermissions(u, false)} disabled={saving === u.id}
                              className="text-xs px-3 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/15 font-semibold transition-all disabled:opacity-40">
                              Revoke All
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {ALL_PAGES.map((page) => {
                            const granted = isAllAccess || perms.includes(page.path);
                            return (
                              <button key={page.path} onClick={() => togglePermission(u, page.path)} disabled={saving === u.id || isAllAccess}
                                className={`flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all disabled:cursor-not-allowed ${
                                  granted ? "bg-green-500/10 border-green-500/25 text-green-300" : "bg-white/4 border-white/8 text-gray-500 hover:border-white/15"
                                }`}>
                                <span>{page.label}</span>
                                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${granted ? "bg-green-500/30 text-green-300" : "bg-white/10 text-gray-600"}`}>
                                  {granted ? "✓" : "✕"}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                        {isAllAccess && (
                          <p className="text-xs text-blue-400/70 mt-1">Admin/full-access users bypass individual page permissions.</p>
                        )}

                        {/* Reset password */}
                        <div className="pt-2 border-t border-white/8">
                          <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Reset Password</p>
                          <div className="flex gap-2">
                            <input
                              type="password"
                              placeholder="New password (min 6 chars)"
                              value={newPwd[u.id] ?? ""}
                              onChange={(e) => setNewPwd((prev) => ({ ...prev, [u.id]: e.target.value }))}
                              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/40 transition-all"
                            />
                            <button
                              onClick={() => resetPassword(u)}
                              disabled={resetting === u.id || !newPwd[u.id] || (newPwd[u.id]?.length ?? 0) < 6}
                              className="px-4 py-2 bg-orange-500/15 hover:bg-orange-500/25 border border-orange-500/25 text-orange-300 text-xs font-bold rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
                            >
                              {resetting === u.id ? "Saving…" : "Set Password"}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* ── Rejected ── */}
          {rejected.length > 0 && (
            <section>
              <p className="text-xs font-black uppercase tracking-widest text-gray-600 mb-3">❌ Rejected ({rejected.length})</p>
              <div className="space-y-2">
                {rejected.map((u) => (
                  <div key={u.id} className="flex items-center gap-4 px-5 py-3.5 rounded-2xl border border-white/5 bg-white/[0.01] opacity-60">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-black text-gray-500 text-sm shrink-0">{u.username[0].toUpperCase()}</div>
                    <span className="flex-1 text-gray-500 font-medium text-sm">{u.username}</span>
                    <button onClick={() => {
                        const current: string[] = JSON.parse(u.permissions || "[]");
                        const merged = Array.from(new Set([...current, ...DEFAULT_PERMISSIONS]));
                        update(u.id, { status: "approved", permissions: merged });
                      }} disabled={saving === u.id}
                      className="text-xs px-3 py-1.5 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/15 font-semibold transition-all">
                      Re-approve
                    </button>
                    <button onClick={() => deleteUser(u.id, u.username)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/15 font-semibold transition-all">
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {users.length === 0 && (
            <div className="text-center py-20 text-gray-600 border border-white/5 rounded-2xl"><div className="text-4xl mb-3">👤</div><p>No users yet.</p></div>
          )}
        </div>
      )}
    </div>
  );
}
