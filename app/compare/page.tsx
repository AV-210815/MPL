"use client";
import { useEffect, useState } from "react";

interface BattingProfile {
  innings: number; runs: number; avg: number | null; sr: number;
  hundreds: number; fifties: number; fours: number; sixes: number;
  bestScore: { runs: number; notOut: boolean } | null;
}
interface BowlingProfile {
  wickets: number; overs: number; runsConceded: number; maidens: number;
  economy: number; avg: number | null;
  bestFigures: { wickets: number; runsConceded: number } | null;
}
interface Profile {
  id: number; name: string; matches: number;
  batting: BattingProfile; bowling: BowlingProfile;
  recentForm: { runs: number; notOut: boolean }[];
  badges: { icon: string; label: string }[];
}

function fmtAvg(v: number | null) { return v === null ? "∞" : v === 0 ? "-" : v.toFixed(1); }
function fmt(n: number, d = 1) { return n % 1 === 0 ? String(n) : n.toFixed(d); }

function formColor(runs: number) {
  if (runs >= 40) return "bg-green-500";
  if (runs >= 25) return "bg-green-400/80";
  if (runs >= 10) return "bg-yellow-400";
  if (runs > 0)   return "bg-orange-500";
  return "bg-red-600";
}

function cmp(a: number | null, b: number | null, higherIsBetter = true): [string, string] {
  if (a === null && b === null) return ["", ""];
  if (a === null) return ["", "text-green-400 font-black"];
  if (b === null) return ["text-green-400 font-black", ""];
  if (a === b) return ["", ""];
  const aWins = higherIsBetter ? a > b : a < b;
  return aWins ? ["text-green-400 font-black", "text-gray-500"] : ["text-gray-500", "text-green-400 font-black"];
}

function computeVerdict(pA: Profile, pB: Profile) {
  let aScore = 0, bScore = 0;
  const breakdown: { label: string; winner: "a" | "b" | "tie" }[] = [];

  function score(label: string, a: number | null, b: number | null, higherIsBetter = true, weight = 1) {
    const av = a ?? (higherIsBetter ? -Infinity : Infinity);
    const bv = b ?? (higherIsBetter ? -Infinity : Infinity);
    if (av === bv) { breakdown.push({ label, winner: "tie" }); return; }
    const aWins = higherIsBetter ? av > bv : av < bv;
    if (aWins) { aScore += weight; breakdown.push({ label, winner: "a" }); }
    else { bScore += weight; breakdown.push({ label, winner: "b" }); }
  }

  score("Runs", pA.batting.runs, pB.batting.runs, true, 2);
  score("Batting Avg", pA.batting.avg === null ? Infinity : pA.batting.avg, pB.batting.avg === null ? Infinity : pB.batting.avg, true, 2);
  score("Strike Rate", pA.batting.sr, pB.batting.sr, true, 1);
  score("100s", pA.batting.hundreds, pB.batting.hundreds, true, 1);
  score("50s", pA.batting.fifties, pB.batting.fifties, true, 0.5);
  score("Sixes", pA.batting.sixes, pB.batting.sixes, true, 0.5);
  score("Wickets", pA.bowling.wickets, pB.bowling.wickets, true, 2);
  score("Economy", pA.bowling.overs > 0 ? pA.bowling.economy : null, pB.bowling.overs > 0 ? pB.bowling.economy : null, false, 1.5);
  score("Bowl Avg", pA.bowling.avg, pB.bowling.avg, false, 1);
  score("Matches", pA.matches, pB.matches, true, 0.5);

  const total = aScore + bScore;
  const winner = aScore > bScore ? "a" : bScore > aScore ? "b" : "tie";
  return { aScore, bScore, total, winner, breakdown };
}

interface StatRowProps {
  label: string;
  aVal: string; bVal: string;
  aClass?: string; bClass?: string;
}
function StatRow({ label, aVal, bVal, aClass = "", bClass = "" }: StatRowProps) {
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center py-2.5 border-b border-white/5">
      <div className={`text-right text-sm font-bold tabular-nums ${aClass || "text-white"}`}>{aVal}</div>
      <div className="text-center text-[10px] uppercase tracking-widest text-gray-600 font-bold w-28">{label}</div>
      <div className={`text-left text-sm font-bold tabular-nums ${bClass || "text-white"}`}>{bVal}</div>
    </div>
  );
}

export default function ComparePage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [a, setA] = useState<number | null>(null);
  const [b, setB] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/profiles").then((r) => r.json()).then((d) => {
      if (Array.isArray(d)) setProfiles(d);
    });
  }, []);

  const pA = profiles.find((p) => p.id === a) ?? null;
  const pB = profiles.find((p) => p.id === b) ?? null;

  function PlayerCard({ p, side, color }: { p: Profile | null; side: "a" | "b"; color: string }) {
    const others = profiles.filter((x) => x.id !== (side === "a" ? b : a));
    return (
      <div className="flex-1 min-w-0">
        <select
          value={p?.id ?? ""}
          onChange={(e) => side === "a" ? setA(Number(e.target.value) || null) : setB(Number(e.target.value) || null)}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/30 transition-all mb-3">
          <option value="">— Select player —</option>
          {others.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
        </select>
        {p && (
          <div className={`rounded-xl border ${color} bg-white/[0.03] p-4 text-center relative overflow-hidden`}>
            <div className="absolute inset-0 opacity-5 pointer-events-none select-none flex items-center justify-center text-[6rem] font-black"
              style={{ fontFamily: "var(--font-bebas)" }}>
              {p.name[0].toUpperCase()}
            </div>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl font-black text-white mx-auto mb-2 relative z-10 ${side === "a" ? "bg-gradient-to-br from-orange-400 to-red-600 shadow-[0_0_20px_rgba(249,115,22,0.3)]" : "bg-gradient-to-br from-purple-400 to-violet-700 shadow-[0_0_20px_rgba(168,85,247,0.3)]"}`}
              style={{ fontFamily: "var(--font-bebas)" }}>
              {p.name[0].toUpperCase()}
            </div>
            <p className="font-black text-white text-xl relative z-10" style={{ fontFamily: "var(--font-rajdhani)" }}>{p.name}</p>
            <p className="text-xs text-gray-500 mt-0.5 relative z-10">{p.matches} matches</p>
            {p.badges.length > 0 && (
              <div className="flex gap-1 flex-wrap justify-center mt-2 relative z-10">
                {p.badges.map((badge) => (
                  <span key={badge.label} className="text-sm" title={badge.label}>{badge.icon}</span>
                ))}
              </div>
            )}
            {p.recentForm.length > 0 && (
              <div className="flex gap-1 justify-center mt-2 relative z-10">
                <span className="text-[9px] text-gray-600 uppercase tracking-wider mr-1 self-center">Form</span>
                {p.recentForm.map((f, i) => (
                  <div key={i} className={`w-5 h-5 rounded-full ${formColor(f.runs)}`} title={`${f.runs}${f.notOut ? "*" : ""}`} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative -mt-6 -mx-4 px-4 pt-0 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 left-1/4 w-[400px] h-[300px] rounded-full bg-blue-600/10 blur-[100px]" />
        <div className="absolute top-60 right-1/4 w-[300px] h-[300px] rounded-full bg-purple-600/8 blur-[80px]" />
        <div className="absolute -top-10 -left-20 w-[300px] h-[300px] rounded-full bg-orange-600/8 blur-[80px]" />
        <div className="absolute inset-0 opacity-[0.015]"
          style={{ backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
      </div>

      <div className="relative pt-8 pb-5">
        <p className="text-[10px] uppercase tracking-[0.3em] text-blue-400/80 font-bold mb-1.5">Head to Head</p>
        <h1 style={{ fontFamily: "var(--font-bebas)", letterSpacing: "0.04em", lineHeight: 1 }}
          className="text-[2.8rem] sm:text-[3.5rem] leading-none">
          <span className="bg-gradient-to-br from-blue-300 to-purple-400 bg-clip-text text-transparent">Player</span>
          {" "}<span className="text-white">Compare</span>
        </h1>
        <p className="text-gray-600 mt-1 text-xs">Side-by-side career stat comparison</p>
        <div className="mt-5 h-px bg-gradient-to-r from-blue-500/30 to-transparent" />
      </div>

      {/* Player selectors */}
      <div className="flex gap-4 items-start mb-8">
        <PlayerCard p={pA} side="a" color="border-orange-500/30" />
        <div className="flex flex-col items-center justify-center pt-14 shrink-0 gap-1">
          <div className="w-px h-6 bg-gradient-to-b from-transparent to-white/10" />
          <span className="text-xl font-black px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-gray-500" style={{ fontFamily: "var(--font-bebas)", letterSpacing: "0.1em" }}>VS</span>
          <div className="w-px h-6 bg-gradient-to-b from-white/10 to-transparent" />
        </div>
        <PlayerCard p={pB} side="b" color="border-purple-500/30" />
      </div>

      {/* Comparison table */}
      {pA && pB ? (
        <>
        {/* Verdict banner */}
        {(() => {
          const v = computeVerdict(pA, pB);
          const winnerName = v.winner === "a" ? pA.name : v.winner === "b" ? pB.name : null;
          const winnerColor = v.winner === "a" ? "from-orange-500/20 to-orange-500/5 border-orange-500/30" : v.winner === "b" ? "from-purple-500/20 to-purple-500/5 border-purple-500/30" : "from-white/10 to-white/5 border-white/20";
          const scoreA = v.aScore % 1 === 0 ? String(v.aScore) : v.aScore.toFixed(1);
          const scoreB = v.bScore % 1 === 0 ? String(v.bScore) : v.bScore.toFixed(1);
          return (
            <div className={`rounded-2xl border bg-gradient-to-br ${winnerColor} p-5 mb-4`}>
              <p className="text-[10px] uppercase tracking-[0.25em] text-gray-500 font-bold mb-2" style={{ fontFamily: "var(--font-oswald)" }}>Overall Verdict</p>
              {winnerName ? (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-2xl font-black text-white" style={{ fontFamily: "var(--font-bebas)", letterSpacing: "0.05em" }}>
                      🏆 {winnerName} wins
                    </p>
                    <span className="text-sm font-black tabular-nums text-gray-300">
                      <span className={v.winner === "a" ? "text-orange-400" : "text-gray-400"}>{scoreA}</span>
                      <span className="text-gray-600 mx-1">—</span>
                      <span className={v.winner === "b" ? "text-purple-400" : "text-gray-400"}>{scoreB}</span>
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {v.breakdown.map((item) => (
                      <span key={item.label} className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${item.winner === "a" ? "bg-orange-500/20 text-orange-300" : item.winner === "b" ? "bg-purple-500/20 text-purple-300" : "bg-white/10 text-gray-500"}`}>
                        {item.winner === "tie" ? "=" : item.winner === "a" ? pA.name.split(" ")[0] : pB.name.split(" ")[0]} {item.label}
                      </span>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-xl font-black text-white" style={{ fontFamily: "var(--font-bebas)", letterSpacing: "0.05em" }}>🤝 It&apos;s a tie! ({scoreA} — {scoreB})</p>
              )}
            </div>
          );
        })()}

        <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden mb-10">
          {/* Section header */}
          <div className="grid grid-cols-[1fr_auto_1fr] border-b border-white/10 bg-white/5">
            <div className="text-right px-4 py-2.5 text-xs font-black text-orange-400 uppercase tracking-wider">{pA.name}</div>
            <div className="w-28" />
            <div className="text-left px-4 py-2.5 text-xs font-black text-purple-400 uppercase tracking-wider">{pB.name}</div>
          </div>

          <div className="px-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-orange-400 py-3" style={{ fontFamily: "var(--font-oswald)" }}>🏏 Batting</p>
            {(() => {
              const [ac, bc] = cmp(pA.batting.runs, pB.batting.runs);
              return <StatRow label="Runs" aVal={String(pA.batting.runs)} bVal={String(pB.batting.runs)} aClass={ac} bClass={bc} />;
            })()}
            {(() => {
              const aAvg = pA.batting.avg; const bAvg = pB.batting.avg;
              const [ac, bc] = cmp(aAvg === null ? Infinity : aAvg, bAvg === null ? Infinity : bAvg);
              return <StatRow label="Average" aVal={fmtAvg(aAvg)} bVal={fmtAvg(bAvg)} aClass={ac} bClass={bc} />;
            })()}
            {(() => {
              const [ac, bc] = cmp(pA.batting.sr, pB.batting.sr);
              return <StatRow label="Strike Rate" aVal={fmt(pA.batting.sr)} bVal={fmt(pB.batting.sr)} aClass={ac} bClass={bc} />;
            })()}
            <StatRow label="Innings" aVal={String(pA.batting.innings)} bVal={String(pB.batting.innings)} />
            {(() => {
              const [ac, bc] = cmp(pA.batting.hundreds, pB.batting.hundreds);
              return <StatRow label="100s" aVal={String(pA.batting.hundreds)} bVal={String(pB.batting.hundreds)} aClass={ac} bClass={bc} />;
            })()}
            {(() => {
              const [ac, bc] = cmp(pA.batting.fifties, pB.batting.fifties);
              return <StatRow label="50s" aVal={String(pA.batting.fifties)} bVal={String(pB.batting.fifties)} aClass={ac} bClass={bc} />;
            })()}
            {(() => {
              const [ac, bc] = cmp(pA.batting.sixes, pB.batting.sixes);
              return <StatRow label="Sixes" aVal={String(pA.batting.sixes)} bVal={String(pB.batting.sixes)} aClass={ac} bClass={bc} />;
            })()}
            <StatRow label="Fours" aVal={String(pA.batting.fours)} bVal={String(pB.batting.fours)} />
            <StatRow label="Best Score"
              aVal={pA.batting.bestScore ? `${pA.batting.bestScore.runs}${pA.batting.bestScore.notOut ? "*" : ""}` : "-"}
              bVal={pB.batting.bestScore ? `${pB.batting.bestScore.runs}${pB.batting.bestScore.notOut ? "*" : ""}` : "-"} />

            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-purple-400 py-3 mt-1 border-t border-white/5" style={{ fontFamily: "var(--font-oswald)" }}>🎯 Bowling</p>
            {(() => {
              const [ac, bc] = cmp(pA.bowling.wickets, pB.bowling.wickets);
              return <StatRow label="Wickets" aVal={String(pA.bowling.wickets)} bVal={String(pB.bowling.wickets)} aClass={ac} bClass={bc} />;
            })()}
            {(() => {
              const aEcon = pA.bowling.overs > 0 ? pA.bowling.economy : null;
              const bEcon = pB.bowling.overs > 0 ? pB.bowling.economy : null;
              const [ac, bc] = cmp(aEcon, bEcon, false);
              return <StatRow label="Economy" aVal={aEcon !== null ? fmt(aEcon, 2) : "-"} bVal={bEcon !== null ? fmt(bEcon, 2) : "-"} aClass={ac} bClass={bc} />;
            })()}
            {(() => {
              const [ac, bc] = cmp(pA.bowling.avg ?? null, pB.bowling.avg ?? null, false);
              return <StatRow label="Bowl Avg" aVal={fmtAvg(pA.bowling.avg)} bVal={fmtAvg(pB.bowling.avg)} aClass={ac} bClass={bc} />;
            })()}
            <StatRow label="Overs" aVal={fmt(pA.bowling.overs)} bVal={fmt(pB.bowling.overs)} />
            <StatRow label="Best Figures"
              aVal={pA.bowling.bestFigures ? `${pA.bowling.bestFigures.wickets}/${pA.bowling.bestFigures.runsConceded}` : "-"}
              bVal={pB.bowling.bestFigures ? `${pB.bowling.bestFigures.wickets}/${pB.bowling.bestFigures.runsConceded}` : "-"} />
          </div>
        </div>
        </>
      ) : (
        <div className="text-center py-20 text-gray-600">
          <div className="text-5xl mb-4">⚔️</div>
          <p className="font-semibold">Select two players above to compare their stats</p>
        </div>
      )}
    </div>
  );
}
