"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Apartment { id: number; name: string; slug: string; description?: string | null; createdAt: string }

const leagueColors = [
  "from-orange-500/20 to-red-500/10 border-orange-500/25",
  "from-purple-500/20 to-violet-500/10 border-purple-500/25",
  "from-blue-500/20 to-cyan-500/10 border-blue-500/25",
  "from-green-500/20 to-emerald-500/10 border-green-500/25",
  "from-pink-500/20 to-rose-500/10 border-pink-500/25",
  "from-amber-500/20 to-yellow-500/10 border-amber-500/25",
];

export default function LoginPage() {
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/apartments")
      .then((r) => r.json())
      .then((d) => { setApartments(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#0d0d1a] px-4 py-12 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] rounded-full bg-orange-600/10 blur-[120px]" />
        <div className="absolute bottom-1/4 -right-32 w-[500px] h-[500px] rounded-full bg-purple-600/10 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <Link href="/">
            <div className="text-5xl mb-4">🏏</div>
          </Link>
          <h1 className="text-5xl text-white tracking-widest uppercase mb-2"
            style={{ fontFamily: "var(--font-bebas)", letterSpacing: "0.1em" }}>
            Sign In
          </h1>
          <p className="text-gray-500 text-sm">Select your league to sign in</p>
        </div>

        {/* League cards */}
        {loading ? (
          <div className="text-center py-16 text-gray-600">
            <div className="w-8 h-8 border-2 border-orange-500/30 border-t-orange-400 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm">Loading leagues…</p>
          </div>
        ) : apartments.length === 0 ? (
          <div className="text-center py-16 text-gray-600 border border-white/5 rounded-2xl bg-white/[0.02]">
            <div className="text-4xl mb-3">🏟️</div>
            <p className="font-semibold">No leagues yet.</p>
            <p className="text-sm mt-1">
              <Link href="/apartments" className="text-indigo-400 hover:text-indigo-300">Create the first one →</Link>
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {apartments.map((apt, idx) => {
              const colorClass = leagueColors[idx % leagueColors.length];
              const initials = apt.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
              return (
                <Link key={apt.id} href={`/${apt.slug}/login`}
                  className={`rounded-2xl border bg-gradient-to-br ${colorClass} p-5 hover:scale-[1.02] transition-all duration-200 flex flex-col gap-3 group`}>
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
                  <div className="mt-auto">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-gray-400 font-semibold">Sign in here →</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-600">
            No account yet?{" "}
            <Link href="/signup" className="text-orange-400 hover:text-orange-300 font-semibold">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
