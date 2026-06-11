"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

function StrengthBar({ password }: { password: string }) {
  const score = [password.length >= 6, password.length >= 10, /[A-Z]/.test(password), /[0-9]/.test(password), /[^a-zA-Z0-9]/.test(password)].filter(Boolean).length;
  const levels = [
    { label: "Too short", color: "bg-red-500" },
    { label: "Weak", color: "bg-red-400" },
    { label: "Fair", color: "bg-yellow-400" },
    { label: "Good", color: "bg-blue-400" },
    { label: "Strong", color: "bg-green-400" },
    { label: "Very strong", color: "bg-green-500" },
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

export default function SignupPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const passwordsMatch = confirm.length === 0 || password === confirm;
  const canSubmit = username.trim().length >= 3 && password.length >= 6 && password === confirm;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: username.trim(), password }),
    });

    if (res.ok) {
      const data = await res.json();
      setSuccess(true);
      setTimeout(() => router.push("/login"), data.status === "approved" ? 1200 : 3000);
    } else {
      const data = await res.json();
      setError(data.error ?? "Something went wrong");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#0d0d1a] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background orbs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/4 -right-32 w-[500px] h-[500px] rounded-full bg-purple-600/10 blur-[120px]" />
        <div className="absolute bottom-1/4 -left-32 w-[500px] h-[500px] rounded-full bg-orange-600/10 blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-green-600/6 blur-[100px]" />
        <div className="absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <div className="text-5xl mb-3">🏏</div>
            <h1 className="text-5xl text-white tracking-widest uppercase"
              style={{ fontFamily: "var(--font-bebas)", letterSpacing: "0.12em" }}>MPL</h1>
            <p className="text-gray-600 text-xs uppercase tracking-[0.2em] mt-1"
              style={{ fontFamily: "var(--font-rajdhani)", fontWeight: 600 }}>Maple Premier League</p>
          </Link>
        </div>

        {/* Success state */}
        {success ? (
          <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/8 p-8 text-center space-y-3">
            <div className="text-5xl">⏳</div>
            <h2 className="font-black text-white text-xl" style={{ fontFamily: "var(--font-rajdhani)" }}>Account created!</h2>
            <p className="text-gray-400 text-sm">Your account is <span className="text-yellow-300 font-semibold">pending admin approval</span>. You&apos;ll be able to log in once approved.</p>
            <p className="text-gray-600 text-xs">Redirecting to login…</p>
            <div className="w-6 h-6 border-2 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin mx-auto mt-2" />
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-sm p-8 space-y-5 shadow-[0_0_60px_rgba(0,0,0,0.5)]">
            <div className="space-y-1 text-center">
              <h2 className="text-xl font-black text-white" style={{ fontFamily: "var(--font-rajdhani)" }}>Create your account</h2>
              <p className="text-gray-600 text-xs">Join the MPL and track your cricket glory</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-widest text-gray-500">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. virat_18"
                  autoComplete="username"
                  maxLength={20}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-orange-500/50 focus:bg-white/8 transition-all"
                />
                <p className="text-[10px] text-gray-700">Letters, numbers and underscores only · 3–20 chars</p>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-widest text-gray-500">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  autoComplete="new-password"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-orange-500/50 focus:bg-white/8 transition-all"
                />
                <StrengthBar password={password} />
              </div>

              {/* Confirm password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-widest text-gray-500">Confirm Password</label>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                  className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-sm text-white placeholder-gray-700 focus:outline-none focus:bg-white/8 transition-all ${
                    !passwordsMatch ? "border-red-500/50 focus:border-red-500/70" : confirm.length > 0 ? "border-green-500/40 focus:border-green-500/60" : "border-white/10 focus:border-orange-500/50"
                  }`}
                />
                {!passwordsMatch && <p className="text-[10px] text-red-400 font-semibold">Passwords don&apos;t match</p>}
                {passwordsMatch && confirm.length > 0 && <p className="text-[10px] text-green-400 font-semibold">✓ Passwords match</p>}
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                  <span>⚠️</span> {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || !canSubmit}
                className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm transition-all shadow-[0_0_24px_rgba(249,115,22,0.35)] hover:shadow-[0_0_32px_rgba(249,115,22,0.55)] mt-1"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating account…
                  </span>
                ) : "Create Account"}
              </button>
            </form>

            <p className="text-center text-xs text-gray-600">
              Already have an account?{" "}
              <Link href="/login" className="text-orange-400 hover:text-orange-300 font-semibold transition-colors">Sign in</Link>
            </p>
          </div>
        )}

        <p className="text-center text-[11px] text-gray-700 mt-6 uppercase tracking-widest"
          style={{ fontFamily: "var(--font-rajdhani)" }}>MPL · Season 2026</p>
      </div>
    </div>
  );
}
