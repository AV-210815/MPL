"use client";
import { useEffect, useState } from "react";

interface MonthMVP {
  month: string;
  matches: number;
  topBatter: { name: string; runs: number; innings: number } | null;
  topBowler: { name: string; wickets: number; innings: number } | null;
}

function Avatar({ name, color }: { name: string; color: string }) {
  return (
    <div className={`w-14 h-14 rounded-full flex items-center justify-center font-black text-2xl text-white shrink-0 ${color}`}
      style={{ fontFamily: "var(--font-bebas)" }}>
      {name[0].toUpperCase()}
    </div>
  );
}

export default function MVPPage() {
  const [data, setData] = useState<MonthMVP[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  async function load() {
    setLoading(true);
    setLoadError(false);
    try {
      const res = await fetch("/api/mvp");
      const d = await res.json();
      setData(Array.isArray(d) ? d : []);
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="relative -mt-6 -mx-4 px-4 pt-0 overflow-hidden">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full bg-yellow-500/10 blur-[100px]" />
        <div className="absolute top-60 -right-20 w-[300px] h-[300px] rounded-full bg-amber-600/8 blur-[80px]" />
      </div>

      {/* Header */}
      <div className="relative pt-8 pb-5">
        <p className="text-[10px] uppercase tracking-[0.3em] text-yellow-500/80 font-bold mb-1.5">Monthly Awards</p>
        <h1 style={{ fontFamily: "var(--font-bebas)", letterSpacing: "0.04em", lineHeight: 1 }}
          className="text-[2.8rem] sm:text-[3.5rem] leading-none">
          <span className="bg-gradient-to-br from-yellow-300 to-amber-500 bg-clip-text text-transparent">MVP</span>
          {" "}<span className="text-white">Leaderboard</span>
        </h1>
        <p className="text-gray-600 mt-1 text-xs">Best batting &amp; bowling performer each month</p>
        <div className="mt-5 h-px bg-gradient-to-r from-yellow-500/30 to-transparent" />
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-600">
          <div className="w-6 h-6 border-2 border-yellow-500/30 border-t-yellow-400 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm">Loading…</p>
        </div>
      ) : loadError ? (
        <div className="text-center py-16 text-gray-600 border border-red-500/10 rounded-2xl bg-red-500/[0.03]">
          <p className="font-semibold text-red-400">Failed to load awards.</p>
          <button onClick={load} className="mt-3 text-xs text-gray-500 hover:text-gray-300 underline">Try again</button>
        </div>
      ) : data.length === 0 ? (
        <div className="text-center py-16 text-gray-600 border border-white/5 rounded-2xl bg-white/[0.02]">
          <p className="font-semibold">No matches yet.</p>
        </div>
      ) : (
        <div className="relative space-y-5 pb-10">
          {data.map((m, idx) => (
            <div key={m.month} className="relative rounded-2xl border border-white/8 overflow-hidden bg-white/[0.02]">
              {/* Gold shimmer on first card */}
              {idx === 0 && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-yellow-500/8 blur-3xl" />
                </div>
              )}

              {/* Month header */}
              <div className={`flex items-center justify-between px-5 py-3.5 border-b border-white/8 ${idx === 0 ? "bg-gradient-to-r from-yellow-500/8 to-transparent" : "bg-gradient-to-r from-white/5 to-transparent"}`}>
                <div className="flex items-center gap-3">
                  {idx === 0 && <span className="text-lg">🏆</span>}
                  <span className="font-black text-white text-lg" style={{ fontFamily: "var(--font-bebas)", letterSpacing: "0.08em" }}>
                    {m.month}
                  </span>
                  {idx === 0 && (
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 font-bold uppercase tracking-wider">
                      Latest
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-600 bg-white/5 px-2.5 py-1 rounded-full border border-white/8">
                  {m.matches} match{m.matches !== 1 ? "es" : ""}
                </span>
              </div>

              <div className="grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-white/8">
                {/* Batting MVP */}
                <div className="px-5 py-5 flex items-center gap-4">
                  {m.topBatter ? (
                    <>
                      <Avatar name={m.topBatter.name} color="bg-gradient-to-br from-orange-600 to-amber-700" />
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-orange-400 font-bold mb-0.5 flex items-center gap-1.5">
                          🏏 Batting MVP
                        </p>
                        <p className="font-black text-white text-xl leading-tight" style={{ fontFamily: "var(--font-rajdhani)" }}>
                          {m.topBatter.name}
                        </p>
                        <div className="flex items-baseline gap-1 mt-0.5">
                          <span className="text-3xl font-black text-orange-300" style={{ fontFamily: "var(--font-bebas)", letterSpacing: "0.05em" }}>
                            {m.topBatter.runs}
                          </span>
                          <span className="text-gray-500 text-xs">runs · {m.topBatter.innings} inn</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className="text-gray-600 text-sm">No batting data</p>
                  )}
                </div>

                {/* Bowling MVP */}
                <div className="px-5 py-5 flex items-center gap-4">
                  {m.topBowler ? (
                    <>
                      <Avatar name={m.topBowler.name} color="bg-gradient-to-br from-purple-600 to-violet-800" />
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-purple-400 font-bold mb-0.5 flex items-center gap-1.5">
                          🎯 Bowling MVP
                        </p>
                        <p className="font-black text-white text-xl leading-tight" style={{ fontFamily: "var(--font-rajdhani)" }}>
                          {m.topBowler.name}
                        </p>
                        <div className="flex items-baseline gap-1 mt-0.5">
                          <span className="text-3xl font-black text-purple-300" style={{ fontFamily: "var(--font-bebas)", letterSpacing: "0.05em" }}>
                            {m.topBowler.wickets}
                          </span>
                          <span className="text-gray-500 text-xs">wkt{m.topBowler.wickets !== 1 ? "s" : ""} · {m.topBowler.innings} inn</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className="text-gray-600 text-sm">No bowling data</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
