import Link from "next/link";
import { prisma } from "@/lib/db";
import type { BattingStat, BowlingStat } from "@/app/generated/prisma/client";
import CricketBall from "@/components/CricketBall";
import CricketPitch from "@/components/CricketPitch";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? "mpl-super-secret-jwt-key-change-in-prod-2026");

async function getRole(): Promise<string | null> {
  try {
    const token = (await cookies()).get("mpl-token")?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, secret);
    return (payload as { role?: string }).role ?? null;
  } catch { return null; }
}

async function getHomeData() {
  const [matches, players] = await Promise.all([
    prisma.match.findMany({ orderBy: { date: "desc" }, include: { batting: true, bowling: true } }),
    prisma.player.findMany({ include: { batting: true, bowling: true } }),
  ]);
  const totalRuns = matches.flatMap((m) => m.batting).reduce((s, b: BattingStat) => s + b.runs, 0);
  const totalWickets = matches.flatMap((m) => m.bowling).reduce((s, b: BowlingStat) => s + b.wickets, 0);
  const totalSixes = matches.flatMap((m) => m.batting).reduce((s, b: BattingStat) => s + b.sixes, 0);
  const totalFours = matches.flatMap((m) => m.batting).reduce((s, b: BattingStat) => s + b.fours, 0);
  const topBatter = players.map((p) => ({ name: p.name, runs: p.batting.reduce((s: number, b: BattingStat) => s + b.runs, 0) })).sort((a, b) => b.runs - a.runs)[0] ?? null;
  const topBowler = players.map((p) => {
    const wickets = p.bowling.reduce((s: number, b: BowlingStat) => s + b.wickets, 0);
    const overs = p.bowling.reduce((s: number, b: BowlingStat) => s + b.overs, 0);
    const runsConceded = p.bowling.reduce((s: number, b: BowlingStat) => s + b.runsConceded, 0);
    const economy = overs > 0 ? runsConceded / overs : Infinity;
    return { name: p.name, wickets, economy };
  }).sort((a, b) => b.wickets - a.wickets || a.economy - b.economy)[0] ?? null;
  const latest = matches[0] ?? null;
  return { matchCount: matches.length, totalRuns, totalWickets, totalSixes, totalFours, topBatter, topBowler, latest };
}

export default async function HomePage() {
  const [{ matchCount, totalRuns, totalWickets, totalSixes, totalFours, topBatter, topBowler, latest }, role] = await Promise.all([getHomeData(), getRole()]);
  const isAdmin = role === "admin" || role === "superadmin";

  return (
    <div className="relative -mt-6 -mx-4 px-4 pt-0 overflow-hidden">

      {/* ── Background ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-orange-600/12 blur-[140px]" />
        <div className="absolute top-10 -right-40 w-[500px] h-[500px] rounded-full bg-purple-600/12 blur-[130px]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] rounded-full bg-blue-600/8 blur-[100px]" />
        <div className="absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
      </div>

      {/* ── Hero ── */}
      <section className="relative flex flex-col items-center text-center pt-14 pb-10 gap-6">
        {/* Cricket pitch behind title */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[480px] h-[480px] opacity-[0.12] pointer-events-none select-none">
          <CricketPitch className="w-full h-full" />
        </div>

        {/* Live badge */}
        <div className="relative flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-gray-400 font-semibold tracking-widest uppercase backdrop-blur-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          Season 2026 · Live
        </div>

        {/* Title */}
        <div className="relative space-y-0">
          <div className="leading-none" style={{ fontFamily: "var(--font-bebas)" }}>
            <div className="text-[5.5rem] sm:text-[8rem] leading-none tracking-tight bg-gradient-to-r from-orange-300 via-orange-400 to-yellow-300 bg-clip-text text-transparent" style={{ letterSpacing: "0.04em" }}>
              Maple
            </div>
            <div className="text-[5.5rem] sm:text-[8rem] leading-none tracking-tight text-white" style={{ letterSpacing: "0.04em" }}>
              Premier
            </div>
            <div className="text-[5.5rem] sm:text-[8rem] leading-none tracking-tight bg-gradient-to-r from-purple-300 via-purple-400 to-blue-300 bg-clip-text text-transparent" style={{ letterSpacing: "0.04em" }}>
              League
            </div>
          </div>
        </div>

        <p className="relative text-gray-400 text-base sm:text-lg max-w-xs leading-relaxed" style={{ fontFamily: "var(--font-rajdhani)", fontWeight: 600 }}>
          Apartment cricket. IPL glory.<br />Every run. Every wicket. Immortalised.
        </p>

        <div className="relative flex gap-3 flex-wrap justify-center">
          {isAdmin && (
            <Link href="/matches/new"
              className="px-7 py-3 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-bold text-sm transition-all shadow-[0_0_30px_rgba(249,115,22,0.5)] hover:shadow-[0_0_40px_rgba(249,115,22,0.7)]"
              style={{ fontFamily: "var(--font-oswald)", letterSpacing: "0.08em" }}>
              + ADD MATCH
            </Link>
          )}
          <Link href="/stats"
            className="px-7 py-3 rounded-xl bg-white/8 hover:bg-white/15 border border-white/15 text-white font-bold text-sm transition-all backdrop-blur-sm"
            style={{ fontFamily: "var(--font-oswald)", letterSpacing: "0.08em" }}>
            LEADERBOARD
          </Link>
        </div>
      </section>

      {/* ── Season Stats ── */}
      <section className="relative mb-10">
        <p className="text-[10px] uppercase tracking-[0.3em] text-gray-600 font-bold mb-3 text-center" style={{ fontFamily: "var(--font-oswald)" }}>Season Stats</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Matches Played", value: matchCount, icon: "🏏", color: "from-blue-500/15 to-blue-600/5", border: "border-blue-500/20", num: "text-blue-300" },
            { label: "Total Runs", value: totalRuns.toLocaleString(), icon: "📈", color: "from-orange-500/15 to-orange-600/5", border: "border-orange-500/20", num: "text-orange-300" },
            { label: "Wickets", value: totalWickets, icon: "🎯", color: "from-purple-500/15 to-purple-600/5", border: "border-purple-500/20", num: "text-purple-300" },
            { label: "Sixes Hit", value: totalSixes, icon: "💥", color: "from-yellow-500/15 to-yellow-600/5", border: "border-yellow-500/20", num: "text-yellow-300" },
          ].map((s) => (
            <div key={s.label} className={`relative flex flex-col items-center gap-1 py-6 px-3 rounded-2xl bg-gradient-to-b ${s.color} border ${s.border} text-center overflow-hidden group transition-all hover:scale-[1.02]`}>
              <div className="absolute top-2 right-2 text-lg opacity-20 select-none">{s.icon}</div>
              <span className={`text-4xl sm:text-5xl font-black ${s.num}`} style={{ fontFamily: "var(--font-oswald)", letterSpacing: "-0.02em" }}>{s.value}</span>
              <span className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-semibold mt-0.5">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Cap Holders ── */}
      {(topBatter || topBowler) && (
        <section className="relative mb-10">
          <p className="text-[10px] uppercase tracking-[0.3em] text-gray-600 font-bold mb-3 text-center" style={{ fontFamily: "var(--font-oswald)" }}>Current Cap Holders</p>
          <div className="grid sm:grid-cols-2 gap-3">
            {topBatter && (
              <Link href="/stats" className="group relative flex items-center gap-4 px-5 py-5 rounded-2xl border border-orange-500/25 bg-gradient-to-br from-orange-500/12 via-orange-500/6 to-transparent hover:border-orange-500/50 hover:from-orange-500/18 transition-all overflow-hidden">
                <div className="absolute -right-6 -top-6 w-28 h-28 opacity-10 group-hover:opacity-15 transition-opacity pointer-events-none">
                  <CricketBall className="w-full h-full" />
                </div>
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-400 to-red-600 flex items-center justify-center font-black text-2xl text-white shrink-0 shadow-[0_0_24px_rgba(249,115,22,0.4)]"
                  style={{ fontFamily: "var(--font-bebas)" }}>
                  {topBatter.name[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-orange-400 font-bold mb-0.5">🟠 Orange Cap</p>
                  <p className="text-white font-black text-xl leading-tight" style={{ fontFamily: "var(--font-rajdhani)" }}>{topBatter.name}</p>
                  <p className="mt-0.5"><span className="text-orange-300 font-black text-2xl" style={{ fontFamily: "var(--font-oswald)" }}>{topBatter.runs}</span><span className="text-gray-500 text-xs ml-1">runs</span></p>
                </div>
              </Link>
            )}
            {topBowler && (
              <Link href="/bowling" className="group relative flex items-center gap-4 px-5 py-5 rounded-2xl border border-purple-500/25 bg-gradient-to-br from-purple-500/12 via-purple-500/6 to-transparent hover:border-purple-500/50 hover:from-purple-500/18 transition-all overflow-hidden">
                <div className="absolute -right-6 -top-6 w-28 h-28 opacity-10 group-hover:opacity-15 transition-opacity pointer-events-none">
                  <CricketBall className="w-full h-full" />
                </div>
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-400 to-violet-700 flex items-center justify-center font-black text-2xl text-white shrink-0 shadow-[0_0_24px_rgba(168,85,247,0.4)]"
                  style={{ fontFamily: "var(--font-bebas)" }}>
                  {topBowler.name[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-purple-400 font-bold mb-0.5">🟣 Purple Cap</p>
                  <p className="text-white font-black text-xl leading-tight" style={{ fontFamily: "var(--font-rajdhani)" }}>{topBowler.name}</p>
                  <p className="mt-0.5"><span className="text-purple-300 font-black text-2xl" style={{ fontFamily: "var(--font-oswald)" }}>{topBowler.wickets}</span><span className="text-gray-500 text-xs ml-1">wickets</span></p>
                </div>
              </Link>
            )}
          </div>
        </section>
      )}

      {/* ── Latest Match ── */}
      {latest && (
        <section className="relative mb-12">
          <p className="text-[10px] uppercase tracking-[0.3em] text-gray-600 font-bold mb-3 text-center" style={{ fontFamily: "var(--font-oswald)" }}>Latest Match</p>
          <Link href="/matches"
            className="group flex items-center justify-between gap-4 px-5 py-4 rounded-2xl bg-white/[0.03] border border-white/8 hover:bg-white/[0.06] hover:border-white/15 transition-all">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center text-xl shrink-0">🏏</div>
              <div className="min-w-0">
                <p className="font-black text-white truncate" style={{ fontFamily: "var(--font-rajdhani)", fontSize: "1.1rem" }}>{latest.label ?? `Match #${latest.id}`}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {new Date(latest.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                  <span className="mx-1.5 text-gray-700">·</span>
                  <span className="text-gray-400 font-semibold">{latest.format}</span>
                </p>
                {latest.result && <p className="text-xs text-green-400 font-semibold mt-0.5">🏆 {latest.result}</p>}
              </div>
            </div>
            <span className="text-gray-600 group-hover:text-orange-400 transition-colors shrink-0 text-lg">›</span>
          </Link>
        </section>
      )}

      <div className="relative text-center pb-8">
        <p className="text-[10px] text-gray-700 tracking-[0.3em] uppercase font-semibold" style={{ fontFamily: "var(--font-oswald)" }}>
          MPL · Maple Premier League · {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
