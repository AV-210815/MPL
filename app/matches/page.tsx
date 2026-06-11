"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import StumpsHit from "@/components/StumpsHit";

interface Player { id: number; name: string }
interface Member { team: number; player: Player }
interface BattingStat { innings: number; team: number; player: Player; runs: number; balls: number; fours: number; sixes: number; notOut: boolean; dnb: boolean }
interface BowlingStat { innings: number; team: number; player: Player; wickets: number; overs: number; runsConceded: number; maidens: number }
interface Match {
  id: number; date: string; label: string | null; format: string;
  team1Name: string; team2Name: string; battingFirst: number;
  result: string | null;
  members: Member[]; batting: BattingStat[]; bowling: BowlingStat[];
}

const formatConfig: Record<string, { badge: string; glow: string; dot: string }> = {
  TEST: { badge: "bg-amber-500/15 text-amber-300 border-amber-500/25", glow: "hover:border-amber-500/30", dot: "bg-amber-400" },
  ODI:  { badge: "bg-blue-500/15 text-blue-300 border-blue-500/25",   glow: "hover:border-blue-500/30",   dot: "bg-blue-400"  },
  T20:  { badge: "bg-purple-500/15 text-purple-300 border-purple-500/25", glow: "hover:border-purple-500/30", dot: "bg-purple-400" },
};

export default function MatchesPage() {
  const router = useRouter();
  const [matches, setMatches] = useState<Match[]>([]);
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.ok ? r.json() : null).then((d) => setIsAdmin(d?.role === "admin"));
  }, []);

  async function load() {
    setLoading(true);
    setLoadError(false);
    try {
      const res = await fetch(date ? `/api/matches?date=${date}` : "/api/matches");
      const data = await res.json();
      setMatches(Array.isArray(data) ? data : []);
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [date]);

  async function deleteMatch(id: number) {
    if (!confirm("Delete this match and all its stats?")) return;
    await fetch(`/api/matches/${id}`, { method: "DELETE" });
    setMatches((prev) => prev.filter((m) => m.id !== id));
  }

  return (
    <div className="relative -mt-6 -mx-4 px-4 pt-0 overflow-hidden">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-[350px] h-[350px] rounded-full bg-blue-600/10 blur-[100px]" />
        <div className="absolute top-80 -left-10 w-[250px] h-[250px] rounded-full bg-cyan-600/8 blur-[80px]" />
      </div>

      {/* Header */}
      <div className="relative pt-10 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <p className="text-xs uppercase tracking-[0.25em] text-blue-400 font-bold mb-1">History</p>
            <h1 className="text-[5rem] sm:text-[7rem] leading-none bg-gradient-to-br from-blue-300 via-blue-400 to-cyan-300 bg-clip-text text-transparent"
              style={{ fontFamily: "var(--font-bebas)", letterSpacing: "0.05em", lineHeight: 1 }}>
              All<br /><span className="text-white">Matches</span>
            </h1>
            <p className="text-gray-500 mt-2 text-sm" style={{ fontFamily: "var(--font-rajdhani)", fontWeight: 600 }}>
              All recorded matches
            </p>
          </div>
          <div className="w-36 h-40 sm:w-44 sm:h-48 shrink-0 self-center opacity-40">
            <StumpsHit className="w-full h-full" />
          </div>
        </div>
        <div className="mt-4 mb-2 h-px bg-gradient-to-r from-blue-500/50 via-blue-500/20 to-transparent" />
        <div className="mt-4 flex items-center gap-3 flex-wrap justify-end">
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
            <span className="text-gray-500 text-xs">📅</span>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
              className="bg-transparent text-sm text-white focus:outline-none w-32" />
            {date && <button onClick={() => setDate("")} className="text-gray-600 hover:text-gray-400 text-xs ml-1">✕</button>}
          </div>
          {isAdmin && (
            <Link href="/matches/new"
              className="px-4 py-2.5 bg-orange-500 hover:bg-orange-400 text-white text-sm font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_28px_rgba(249,115,22,0.5)]">
              + Add Match
            </Link>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-600">
          <div className="text-4xl mb-3 animate-pulse">📋</div>
          <p>Loading matches…</p>
        </div>
      ) : loadError ? (
        <div className="text-center py-20 text-gray-600 border border-red-500/10 rounded-2xl bg-red-500/[0.03]">
          <div className="text-4xl mb-3">⚠️</div>
          <p className="font-semibold text-red-400">Failed to load matches.</p>
          <button onClick={load} className="mt-3 text-xs text-gray-500 hover:text-gray-300 underline">Try again</button>
        </div>
      ) : matches.length === 0 ? (
        <div className="text-center py-20 text-gray-600 border border-white/5 rounded-2xl bg-white/[0.02]">
          <div className="text-4xl mb-3">📭</div>
          <p className="font-semibold">No matches found.</p>
          <Link href="/matches/new" className="text-orange-400 hover:text-orange-300 text-sm mt-1 inline-block">Add one →</Link>
        </div>
      ) : (
        <div className="relative space-y-3 pb-10">
          {matches.map((m) => {
            const cfg = formatConfig[m.format] ?? formatConfig.ODI;
            const inningsNums = Array.from(new Set([...m.batting.map((b) => b.innings), ...m.bowling.map((b) => b.innings)])).sort();
            const isOpen = expanded === m.id;

            return (
              <div key={m.id}
                className={`rounded-2xl border overflow-hidden transition-all duration-200 bg-white/[0.02] ${isOpen ? "border-white/15" : `border-white/8 ${cfg.glow}`}`}>

                {/* Match header */}
                <div className="flex items-center gap-3 px-5 py-4">
                  {/* Format dot */}
                  <div className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot}`} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase tracking-wider ${cfg.badge}`}>{m.format}</span>
                      <span className="font-black text-white" style={{ fontFamily: "var(--font-rajdhani)" }}>
                        {m.label ?? `Match #${m.id}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap mt-1">
                      <span className="text-xs text-gray-600">
                        {new Date(m.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                      <span className="text-gray-700">·</span>
                      <span className="text-xs text-blue-300 font-medium">{m.team1Name || "Team 1"}</span>
                      <span className="text-gray-700 text-xs">vs</span>
                      <span className="text-xs text-green-300 font-medium">{m.team2Name || "Team 2"}</span>
                      <span className="text-gray-700">·</span>
                      <span className="text-xs text-gray-600">{inningsNums.length} inn</span>
                    </div>
                    {m.result && (
                      <div className="mt-1.5 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-green-500/10 border border-green-500/25 text-green-400 text-xs font-semibold">
                        🏆 {m.result}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button onClick={() => setExpanded(isOpen ? null : m.id)}
                      className="px-3 py-1.5 bg-white/8 hover:bg-white/15 text-xs text-gray-300 rounded-lg transition-colors font-medium">
                      {isOpen ? "Hide" : "View"}
                    </button>
                    {isAdmin && (
                      <>
                        <button onClick={() => router.push(`/matches/${m.id}`)}
                          className="px-3 py-1.5 bg-blue-500/15 hover:bg-blue-500/25 text-xs text-blue-300 rounded-lg transition-colors font-medium border border-blue-500/20">
                          Edit
                        </button>
                        <button onClick={() => deleteMatch(m.id)}
                          className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-xs text-red-400 rounded-lg transition-colors font-medium border border-red-500/15">
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Scorecard */}
                {isOpen && (
                  <div className="border-t border-white/8 px-5 py-5 space-y-6 text-sm">
                    {inningsNums.map((n) => {
                      const battingStats = m.batting.filter((b) => b.innings === n);
                      const bowlingStats = m.bowling.filter((b) => b.innings === n);
                      const batTeam = battingStats[0]?.team ?? 1;
                      const bowlTeam = bowlingStats[0]?.team ?? 2;
                      const batName = batTeam === 1 ? m.team1Name : m.team2Name;
                      const bowlName = bowlTeam === 1 ? m.team1Name : m.team2Name;
                      const totalRuns = battingStats.filter(b => !b.dnb).reduce((s, b) => s + b.runs, 0);
                      const totalWkts = battingStats.filter(b => !b.notOut && !b.dnb).length;
                      return (
                        <div key={n}>
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-600">Innings {n}</span>
                            <div className="flex-1 h-px bg-white/5" />
                            <span className="text-xs font-bold text-white">
                              {totalRuns}/{totalWkts}
                            </span>
                          </div>
                          <div className="grid md:grid-cols-2 gap-4">
                            {/* Batting */}
                            <div className="rounded-xl bg-orange-500/5 border border-orange-500/10 overflow-hidden">
                              <div className="px-3 py-2 border-b border-orange-500/10">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-orange-400">🏏 {batName} — Batting</p>
                              </div>
                              <table className="w-full text-xs">
                                <thead>
                                  <tr className="text-gray-600">
                                    <th className="text-left px-3 py-1.5">Player</th>
                                    <th className="text-center px-2 py-1.5">R</th>
                                    <th className="text-center px-2 py-1.5">B</th>
                                    <th className="text-center px-2 py-1.5">4s</th>
                                    <th className="text-center px-2 py-1.5">6s</th>
                                    <th className="text-center px-2 py-1.5">NO</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {battingStats.filter(b => !b.dnb).map(b => (
                                    <tr key={b.player.id} className="border-t border-white/5">
                                      <td className="px-3 py-1.5 text-white font-medium">{b.player.name}</td>
                                      <td className="px-2 py-1.5 text-center font-bold text-orange-300">{b.runs}</td>
                                      <td className="px-2 py-1.5 text-center text-gray-500">{b.balls}</td>
                                      <td className="px-2 py-1.5 text-center text-gray-500">{b.fours}</td>
                                      <td className="px-2 py-1.5 text-center text-gray-500">{b.sixes}</td>
                                      <td className="px-2 py-1.5 text-center text-gray-500">{b.notOut ? "✓" : "—"}</td>
                                    </tr>
                                  ))}
                                  {battingStats.filter(b => b.dnb).map(b => (
                                    <tr key={b.player.id} className="border-t border-white/5 opacity-30">
                                      <td className="px-3 py-1.5 text-white">{b.player.name}</td>
                                      <td className="px-2 py-1.5 text-center text-gray-600" colSpan={5}>DNB</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                            {/* Bowling */}
                            <div className="rounded-xl bg-purple-500/5 border border-purple-500/10 overflow-hidden">
                              <div className="px-3 py-2 border-b border-purple-500/10">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-purple-400">🎯 {bowlName} — Bowling</p>
                              </div>
                              <table className="w-full text-xs">
                                <thead>
                                  <tr className="text-gray-600">
                                    <th className="text-left px-3 py-1.5">Player</th>
                                    <th className="text-center px-2 py-1.5">W</th>
                                    <th className="text-center px-2 py-1.5">Ov</th>
                                    <th className="text-center px-2 py-1.5">R</th>
                                    <th className="text-center px-2 py-1.5">Mdn</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {bowlingStats.map(b => (
                                    <tr key={b.player.id} className="border-t border-white/5">
                                      <td className="px-3 py-1.5 text-white font-medium">{b.player.name}</td>
                                      <td className="px-2 py-1.5 text-center font-bold text-purple-300">{b.wickets}</td>
                                      <td className="px-2 py-1.5 text-center text-gray-500">{b.overs}</td>
                                      <td className="px-2 py-1.5 text-center text-gray-500">{b.runsConceded}</td>
                                      <td className="px-2 py-1.5 text-center text-gray-500">{b.maidens}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
