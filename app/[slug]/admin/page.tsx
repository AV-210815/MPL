"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface User { id: number; username: string; role: string; status: string; permissions: string; createdAt: string }

const ALL_PAGES = [
  { path: "/stats", label: "🟠 Orange Cap" }, { path: "/bowling", label: "🟣 Purple Cap" },
  { path: "/mvp", label: "🏆 MVP" }, { path: "/explosive", label: "💥 Explosive" },
  { path: "/matches", label: "📋 Matches" }, { path: "/profiles", label: "📊 Profiles" },
  { path: "/players", label: "👤 Players" },
];

const statusBadge: Record<string, string> = {
  pending:  "bg-yellow-500/15 text-yellow-300 border-yellow-500/25",
  approved: "bg-green-500/15 text-green-300 border-green-500/25",
  rejected: "bg-red-500/15 text-red-400 border-red-500/25",
};
const roleBadge: Record<string, string> = {
  admin: "bg-orange-500/15 text-orange-300 border-orange-500/25",
  user:  "bg-white/8 text-gray-400 border-white/10",
};

export default function SlugAdminPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [saving, setSaving] = useState<number | null>(null);
  const [newPwd, setNewPwd] = useState<Record<number, string>>({});
  const [myId, setMyId] = useState<number | null>(null);

  useEffect(() => {
    if (!slug) return;
    fetch("/api/auth/me")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        if (!d || d.slug !== slug || d.role !== "admin") { router.push(`/${slug}`); return; }
        setMyId(d.userId);
        load();
      });
  }, [slug]);

  async function load() {
    const res = await fetch("/api/admin/users");
    if (res.ok) setUsers(await res.json());
    setLoading(false);
  }

  async function update(id: number, data: object) {
    setSaving(id);
    await fetch(`/api/admin/users/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
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
    setSaving(user.id);
    await fetch(`/api/admin/users/${user.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ newPassword: pwd }) });
    setNewPwd((prev) => ({ ...prev, [user.id]: "" }));
    setSaving(null);
  }

  if (loading) return <div className="text-center py-20 text-gray-600"><div className="text-4xl mb-3 animate-pulse">⚙️</div><p>Loading…</p></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-1 h-8 rounded-full bg-orange-500" />
        <h1 className="text-2xl font-black text-white">Admin Panel</h1>
      </div>
      <p className="text-gray-500 text-sm">Manage users in this league.</p>

      <div className="space-y-3">
        {users.filter(u => u.id !== myId).map((user) => {
          const perms: string[] = JSON.parse(user.permissions || "[]");
          const isOpen = expanded === user.id;
          return (
            <div key={user.id} className="rounded-2xl border border-white/8 bg-white/[0.02] overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-4 flex-wrap">
                <div className="w-9 h-9 rounded-full bg-orange-500/20 border border-orange-500/40 flex items-center justify-center font-black text-orange-300 shrink-0"
                  style={{ fontFamily: "var(--font-bebas)", fontSize: "1.2rem" }}>
                  {user.username[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-black text-white" style={{ fontFamily: "var(--font-rajdhani)" }}>{user.username}</span>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase tracking-wider ${statusBadge[user.status] ?? statusBadge.pending}`}>{user.status}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase tracking-wider ${roleBadge[user.role] ?? roleBadge.user}`}>{user.role}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  {user.status === "pending" && (
                    <>
                      <button onClick={() => update(user.id, { status: "approved" })} disabled={saving === user.id}
                        className="px-3 py-1.5 text-xs bg-green-500/15 hover:bg-green-500/25 border border-green-500/25 text-green-300 rounded-lg font-semibold transition-all disabled:opacity-40">
                        {saving === user.id ? "…" : "Approve"}
                      </button>
                      <button onClick={() => update(user.id, { status: "rejected" })} disabled={saving === user.id}
                        className="px-3 py-1.5 text-xs bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-lg font-semibold transition-all disabled:opacity-40">
                        Reject
                      </button>
                    </>
                  )}
                  <button onClick={() => setExpanded(isOpen ? null : user.id)}
                    className="px-3 py-1.5 text-xs bg-white/8 hover:bg-white/15 text-gray-300 rounded-lg font-medium transition-colors">
                    {isOpen ? "▲" : "▼"}
                  </button>
                  <button onClick={() => deleteUser(user.id, user.username)}
                    className="px-3 py-1.5 text-xs bg-red-500/8 hover:bg-red-500/18 border border-red-500/15 text-red-500 rounded-lg font-medium transition-colors">
                    Delete
                  </button>
                </div>
              </div>

              {isOpen && (
                <div className="border-t border-white/8 px-5 py-4 space-y-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Role</p>
                    <div className="flex gap-2">
                      {["user", "admin"].map((r) => (
                        <button key={r} onClick={() => update(user.id, { role: r })} disabled={saving === user.id}
                          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-40 ${user.role === r ? "bg-orange-500 text-white" : "bg-white/5 text-gray-400 hover:bg-white/10"}`}>
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Permissions</p>
                      <div className="flex gap-2">
                        <button onClick={() => setAllPermissions(user, true)} className="text-[10px] text-green-400 hover:text-green-300">All access</button>
                        <button onClick={() => setAllPermissions(user, false)} className="text-[10px] text-red-400 hover:text-red-300">Remove all</button>
                      </div>
                    </div>
                    {perms.includes("*") ? (
                      <p className="text-sm text-green-400 font-semibold">✓ Full access to everything</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {ALL_PAGES.map((page) => (
                          <button key={page.path} onClick={() => togglePermission(user, page.path)} disabled={saving === user.id}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-40 border ${perms.includes(page.path) ? "bg-blue-500/20 border-blue-500/35 text-blue-300" : "bg-white/5 border-white/10 text-gray-500 hover:bg-white/10"}`}>
                            {page.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Reset Password</p>
                    <div className="flex gap-2">
                      <input type="password" placeholder="New password (min 6 chars)" value={newPwd[user.id] ?? ""}
                        onChange={(e) => setNewPwd((p) => ({ ...p, [user.id]: e.target.value }))}
                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white placeholder-gray-600 focus:outline-none" />
                      <button onClick={() => resetPassword(user)} disabled={!newPwd[user.id] || newPwd[user.id].length < 6 || saving === user.id}
                        className="px-4 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-300 text-xs font-bold rounded-lg transition-all disabled:opacity-40">
                        {saving === user.id ? "…" : "Reset"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {users.filter(u => u.id !== myId).length === 0 && (
          <div className="text-center py-12 text-gray-600 border border-white/5 rounded-2xl bg-white/[0.02]">
            <p className="font-semibold">No other users yet.</p>
            <p className="text-sm mt-1">Share the signup link with your league members.</p>
          </div>
        )}
      </div>
    </div>
  );
}
