"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Apartment { id: number; name: string; slug: string; description?: string | null; createdAt: string }

export default function ApartmentsPage() {
  const router = useRouter();
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);

  const autoSlug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 30);

  useEffect(() => {
    fetch("/api/apartments")
      .then((r) => r.json())
      .then((d) => { setApartments(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
    fetch("/api/auth/me").then((r) => r.ok ? r.json() : null).then((me) => {
      if (me?.role === "superadmin") setIsSuperAdmin(true);
    }).catch(() => {});
  }, []);

  async function handleDelete(apt: Apartment) {
    if (!confirm(`Delete "${apt.name}"? This will permanently remove all its players, matches, and users.`)) return;
    setDeleting(apt.id);
    const res = await fetch(`/api/apartments/${apt.id}`, { method: "DELETE" });
    if (res.ok) {
      setApartments((prev) => prev.filter((a) => a.id !== apt.id));
    } else {
      const data = await res.json();
      alert(data.error ?? "Failed to delete league");
    }
    setDeleting(null);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError("");
    const res = await fetch("/api/apartments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), slug: slug || autoSlug, description: description.trim() }),
    });
    if (res.ok) {
      const apt = await res.json();
      router.push(`/${apt.slug}/signup`);
    } else {
      const data = await res.json();
      setError(data.error ?? "Failed to create league");
    }
    setCreating(false);
  }

  const leagueColors = [
    "from-orange-500/20 to-red-500/10 border-orange-500/25",
    "from-purple-500/20 to-violet-500/10 border-purple-500/25",
    "from-blue-500/20 to-cyan-500/10 border-blue-500/25",
    "from-green-500/20 to-emerald-500/10 border-green-500/25",
    "from-pink-500/20 to-rose-500/10 border-pink-500/25",
    "from-amber-500/20 to-yellow-500/10 border-amber-500/25",
  ];

  return (
    <div className="relative -mt-6 -mx-4 px-4 pt-0 overflow-hidden">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 left-1/3 w-[500px] h-[300px] rounded-full bg-indigo-600/10 blur-[120px]" />
        <div className="absolute top-60 -right-10 w-[300px] h-[300px] rounded-full bg-purple-600/8 blur-[90px]" />
        <div className="absolute bottom-20 -left-20 w-[300px] h-[300px] rounded-full bg-blue-600/8 blur-[80px]" />
      </div>

      {/* Header */}
      <div className="relative pt-8 pb-5">
        <p className="text-[10px] uppercase tracking-[0.3em] text-indigo-400/80 font-bold mb-1.5">Cricket Leagues</p>
        <h1 style={{ fontFamily: "var(--font-bebas)", letterSpacing: "0.04em", lineHeight: 1 }}
          className="text-[2.8rem] sm:text-[3.5rem] leading-none">
          <span className="bg-gradient-to-br from-indigo-300 to-purple-400 bg-clip-text text-transparent">All</span>
          {" "}<span className="text-white">Leagues</span>
        </h1>
        <p className="text-gray-600 mt-1 text-xs">Find your apartment league or start a new one</p>
        <div className="mt-5 h-px bg-gradient-to-r from-indigo-500/30 to-transparent" />
      </div>

      {/* Create League CTA */}
      <div className="relative mb-8">
        {showForm ? (
          <div className="rounded-2xl border border-indigo-500/25 bg-indigo-500/5 p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-black text-white text-lg" style={{ fontFamily: "var(--font-rajdhani)" }}>Create Your League</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-300 text-xs">✕ Cancel</button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-widest text-gray-500">League Name *</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Oak Apartments Cricket"
                    required maxLength={60}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-widest text-gray-500">URL Slug *</label>
                  <input type="text" value={slug || autoSlug} onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                    placeholder={autoSlug || "e.g. oak-apts"} maxLength={30}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 font-mono transition-all" />
                  {(slug || autoSlug) && (
                    <p className="text-[11px] text-gray-600">Your league will be at <span className="text-indigo-400 font-mono">/{slug || autoSlug}</span></p>
                  )}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-widest text-gray-500">Description (optional)</label>
                <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. Cricket league for Block B residents"
                  maxLength={200}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 transition-all" />
              </div>
              {error && (
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                  <span>⚠️</span> {error}
                </div>
              )}
              <div className="flex gap-3">
                <button type="submit" disabled={creating || !(name.trim()) || !(slug || autoSlug)}
                  className="flex-1 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-400 disabled:opacity-40 text-white font-bold text-sm transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)]">
                  {creating ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating…
                    </span>
                  ) : "Create League & Sign Up as Admin"}
                </button>
              </div>
              <p className="text-xs text-gray-600 text-center">
                You&apos;ll be taken to the signup page where you&apos;ll automatically become the admin.
              </p>
            </form>
          </div>
        ) : (
          <button onClick={() => setShowForm(true)}
            className="w-full py-4 rounded-2xl border border-dashed border-indigo-500/40 hover:border-indigo-500/70 bg-indigo-500/5 hover:bg-indigo-500/10 transition-all group flex items-center justify-center gap-3">
            <span className="text-2xl group-hover:scale-110 transition-transform">🏏</span>
            <div className="text-left">
              <p className="font-black text-white text-sm" style={{ fontFamily: "var(--font-rajdhani)" }}>Start Your Own League</p>
              <p className="text-xs text-gray-600">Create a free cricket stats tracker for your apartment</p>
            </div>
            <span className="ml-auto text-indigo-400 text-sm font-bold">Create →</span>
          </button>
        )}
      </div>

      {/* Leagues list */}
      {loading ? (
        <div className="text-center py-16 text-gray-600"><div className="text-4xl mb-3 animate-pulse">🏘️</div><p>Loading leagues…</p></div>
      ) : apartments.length === 0 ? (
        <div className="text-center py-16 text-gray-600 border border-white/5 rounded-2xl bg-white/[0.02]">
          <div className="text-4xl mb-3">🏟️</div>
          <p className="font-semibold">No other leagues yet.</p>
          <p className="text-sm mt-1">Be the first to create one!</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-10">
          {apartments.map((apt, idx) => {
            const colorClass = leagueColors[idx % leagueColors.length];
            const initials = apt.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
            const isRoot = apt.id === 1;
            return (
              <div key={apt.id} className="relative group">
                <Link href={`/${apt.slug}`}
                  className={`rounded-2xl border bg-gradient-to-br ${colorClass} p-5 hover:scale-[1.02] transition-all duration-200 cursor-pointer flex flex-col gap-3 block`}>
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center font-black text-white text-lg shrink-0"
                      style={{ fontFamily: "var(--font-bebas)" }}>
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-white leading-tight" style={{ fontFamily: "var(--font-rajdhani)" }}>{apt.name}</p>
                      <p className="text-[11px] text-gray-500 font-mono mt-0.5">/{apt.slug}</p>
                    </div>
                    <span className="text-gray-500 group-hover:text-white transition-colors text-sm">→</span>
                  </div>
                  {apt.description && (
                    <p className="text-xs text-gray-500 leading-relaxed">{apt.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-auto">
                    <span className="text-[10px] text-gray-600 uppercase tracking-wider">
                      Since {new Date(apt.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                    </span>
                    <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-gray-400 font-semibold">View League →</span>
                  </div>
                </Link>
                {isSuperAdmin && !isRoot && (
                  <button
                    onClick={() => handleDelete(apt)}
                    disabled={deleting === apt.id}
                    className="absolute top-3 right-3 w-7 h-7 rounded-full bg-red-500/0 hover:bg-red-500/90 border border-red-500/0 hover:border-red-500 flex items-center justify-center text-red-400/0 hover:text-white transition-all duration-150 opacity-0 group-hover:opacity-100 text-xs font-bold disabled:opacity-50"
                    title="Delete league"
                  >
                    {deleting === apt.id ? "…" : "✕"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
