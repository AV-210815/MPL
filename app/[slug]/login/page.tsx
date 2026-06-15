"use client";
import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

export default function SlugLoginPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const u = username.trim();
    const p = password;
    if (!u || !p) { setError("Please enter your username and password"); return; }
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: u, password: p, slug }),
    });
    if (res.ok) {
      router.push(`/${slug}`);
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error ?? "Login failed");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#0d0d1a] flex items-center justify-center px-4 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] rounded-full bg-orange-600/10 blur-[120px]" />
        <div className="absolute bottom-1/4 -right-32 w-[500px] h-[500px] rounded-full bg-purple-600/10 blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
      </div>

      <div className="relative w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href={`/${slug}`} className="inline-block">
            <div className="text-5xl mb-3">🏏</div>
            <h1 className="text-4xl text-white tracking-widest uppercase" style={{ fontFamily: "var(--font-bebas)", letterSpacing: "0.12em" }}>
              {slug}
            </h1>
            <p className="text-gray-600 text-xs uppercase tracking-[0.2em] mt-1" style={{ fontFamily: "var(--font-rajdhani)", fontWeight: 600 }}>
              Cricket League
            </p>
          </Link>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-sm p-8 space-y-5 shadow-[0_0_60px_rgba(0,0,0,0.5)]">
          <div className="space-y-1 text-center">
            <h2 className="text-xl font-black text-white" style={{ fontFamily: "var(--font-rajdhani)" }}>Sign in to your league</h2>
            <p className="text-gray-600 text-xs">Members of this apartment league</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-widest text-gray-500">Username</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username" autoComplete="username" required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-orange-500/50 transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-widest text-gray-500">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password" autoComplete="current-password" required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-orange-500/50 transition-all" />
            </div>
            {error && (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                <span>⚠️</span> {error}
              </div>
            )}
            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-400 disabled:opacity-40 text-white font-bold text-sm transition-all shadow-[0_0_24px_rgba(249,115,22,0.35)] mt-1">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in…
                </span>
              ) : "Sign In"}
            </button>
          </form>

          <p className="text-center text-xs text-gray-600">
            New member?{" "}
            <Link href={`/${slug}/signup`} className="text-orange-400 hover:text-orange-300 font-semibold">Sign up</Link>
          </p>
          <div className="text-center pt-1">
            <Link href="/apartments" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">← All Leagues</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
