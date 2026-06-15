"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

function StrengthBar({ password }: { password: string }) {
  const score = [password.length >= 6, password.length >= 10, /[A-Z]/.test(password), /[0-9]/.test(password), /[^a-zA-Z0-9]/.test(password)].filter(Boolean).length;
  const levels = [
    { label: "Too short", color: "bg-red-500" }, { label: "Weak", color: "bg-red-400" },
    { label: "Fair", color: "bg-yellow-400" }, { label: "Good", color: "bg-blue-400" },
    { label: "Strong", color: "bg-green-400" }, { label: "Very strong", color: "bg-green-500" },
  ];
  const level = password.length === 0 ? null : levels[Math.min(score, 5)];
  if (!level) return null;
  return (
    <div className="space-y-1.5 mt-1">
      <div className="flex gap-1">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i < score ? level.color : "bg-white/10"}`} />
        ))}
      </div>
      <p className={`text-[10px] font-semibold ${level.color.replace("bg-", "text-")}`}>{level.label}</p>
    </div>
  );
}

export default function SlugSignupPage() {
  const { slug } = useParams<{ slug: string }>();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const passwordsMatch = confirm.length === 0 || password === confirm;
  const usernameError = username.length > 0 && !/^[a-zA-Z0-9_]+$/.test(username)
    ? "Only letters, numbers, and underscores — no spaces or special characters"
    : null;
  const canSubmit = username.trim().length >= 3 && !usernameError && password.length >= 6 && password === confirm;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: username.trim(), password, slug }),
    });
    if (res.ok) {
      setSuccess(true);
    } else {
      const data = await res.json();
      setError(data.error ?? "Signup failed");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#0d0d1a] flex items-center justify-center px-4 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/4 -right-32 w-[500px] h-[500px] rounded-full bg-orange-600/10 blur-[120px]" />
        <div className="absolute bottom-1/4 -left-32 w-[500px] h-[500px] rounded-full bg-purple-600/10 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href={`/${slug}`} className="inline-block">
            <div className="text-5xl mb-3">🏏</div>
            <h1 className="text-4xl text-white tracking-widest uppercase" style={{ fontFamily: "var(--font-bebas)", letterSpacing: "0.12em" }}>{slug}</h1>
            <p className="text-gray-600 text-xs uppercase tracking-[0.2em] mt-1" style={{ fontFamily: "var(--font-rajdhani)", fontWeight: 600 }}>Cricket League</p>
          </Link>
        </div>

        {success ? (
          <div className="rounded-2xl border border-green-500/25 bg-green-500/10 p-8 text-center space-y-4">
            <div className="text-5xl">✅</div>
            <h2 className="text-xl font-black text-white" style={{ fontFamily: "var(--font-rajdhani)" }}>Account requested!</h2>
            <p className="text-gray-400 text-sm">Your account is pending approval by the league admin. You&apos;ll be able to sign in once approved.</p>
            <Link href={`/${slug}/login`} className="block w-full py-3 rounded-xl bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 text-orange-300 font-bold text-sm text-center transition-all">
              Back to Sign In
            </Link>
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-sm p-8 space-y-5 shadow-[0_0_60px_rgba(0,0,0,0.5)]">
            <div className="text-center">
              <h2 className="text-xl font-black text-white" style={{ fontFamily: "var(--font-rajdhani)" }}>Join the league</h2>
              <p className="text-gray-600 text-xs mt-1">Request access to this apartment league</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-widest text-gray-500">Username</label>
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                  placeholder="Choose a username" autoComplete="username" required minLength={3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-orange-500/50 transition-all" />
                {usernameError
                  ? <p className="text-[11px] text-red-400">{usernameError}</p>
                  : username.length > 0 && username.length < 3
                    ? <p className="text-[11px] text-red-400">At least 3 characters required</p>
                    : null
                }
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-widest text-gray-500">Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="Choose a password" autoComplete="new-password" required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-orange-500/50 transition-all" />
                <StrengthBar password={password} />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-widest text-gray-500">Confirm Password</label>
                <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Repeat password" autoComplete="new-password" required
                  className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-sm text-white placeholder-gray-700 focus:outline-none transition-all ${!passwordsMatch ? "border-red-500/50" : "border-white/10 focus:border-orange-500/50"}`} />
                {!passwordsMatch && <p className="text-[11px] text-red-400">Passwords don&apos;t match</p>}
              </div>

              {error && (
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                  <span>⚠️</span> {error}
                </div>
              )}

              <button type="submit" disabled={loading || !canSubmit}
                className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-400 disabled:opacity-40 text-white font-bold text-sm transition-all shadow-[0_0_24px_rgba(249,115,22,0.35)] mt-1">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating account…
                  </span>
                ) : "Request Access"}
              </button>
            </form>

            <p className="text-center text-xs text-gray-600">
              Already a member?{" "}
              <Link href={`/${slug}/login`} className="text-orange-400 hover:text-orange-300 font-semibold">Sign in</Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
