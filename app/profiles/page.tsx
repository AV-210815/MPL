"use client";
import { useEffect, useState } from "react";
import Image from "next/image";

interface BattingProfile {
  innings: number; runs: number; avg: number | null; sr: number;
  hundreds: number; fifties: number; fours: number; sixes: number;
  bestScore: { runs: number; notOut: boolean } | null;
}
interface BowlingProfile {
  wickets: number; maidens: number; overs: number;
  runsConceded: number; economy: number; avg: number | null;
  bestFigures: { wickets: number; runsConceded: number } | null;
}
interface Badge { icon: string; label: string; desc: string }
interface Profile {
  id: number; name: string; photo?: string | null; matches: number;
  batting: BattingProfile; bowling: BowlingProfile;
  recentForm: { runs: number; notOut: boolean }[];
  badges: Badge[];
}

function fmtAvg(v: number | null) {
  if (v === null) return "∞";
  if (v === 0) return "-";
  return v.toFixed(1);
}
function fmt(n: number, d = 1) { return n % 1 === 0 ? String(n) : n.toFixed(d); }

const cardThemes = [
  { banner: "from-orange-600 via-red-600 to-rose-700",    glow: "rgba(249,115,22,0.35)",  ring: "ring-orange-500/40",  accent: "text-orange-300",  border: "border-orange-500/25" },
  { banner: "from-purple-600 via-violet-600 to-indigo-700", glow: "rgba(168,85,247,0.35)", ring: "ring-purple-500/40",  accent: "text-purple-300",  border: "border-purple-500/25" },
  { banner: "from-blue-600 via-cyan-600 to-teal-700",     glow: "rgba(59,130,246,0.35)",  ring: "ring-blue-500/40",   accent: "text-blue-300",    border: "border-blue-500/25"   },
  { banner: "from-green-600 via-emerald-600 to-teal-700", glow: "rgba(34,197,94,0.35)",   ring: "ring-green-500/40",  accent: "text-green-300",   border: "border-green-500/25"  },
  { banner: "from-pink-600 via-rose-600 to-red-700",      glow: "rgba(236,72,153,0.35)",  ring: "ring-pink-500/40",   accent: "text-pink-300",    border: "border-pink-500/25"   },
  { banner: "from-amber-500 via-yellow-500 to-orange-600", glow: "rgba(245,158,11,0.35)", ring: "ring-amber-500/40",  accent: "text-amber-300",   border: "border-amber-500/25"  },
];

function formColor(runs: number) {
  if (runs >= 40) return "bg-green-500 text-white";
  if (runs >= 25) return "bg-green-400/80 text-white";
  if (runs >= 10) return "bg-yellow-400 text-black";
  if (runs > 0)   return "bg-orange-500 text-white";
  return "bg-red-600 text-white";
}

function FormDots({ form }: { form: { runs: number; notOut: boolean }[] }) {
  if (form.length === 0) return null;
  return (
    <div className="flex items-center gap-1.5 mb-3">
      <span className="text-[9px] uppercase tracking-widest text-gray-600 font-bold mr-0.5">Form</span>
      {form.map((f, i) => (
        <div key={i} title={`${f.runs}${f.notOut ? "*" : ""}`}
          className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black ${formColor(f.runs)}`}>
          {f.runs}{f.notOut ? "*" : ""}
        </div>
      ))}
      {Array.from({ length: Math.max(0, 5 - form.length) }).map((_, i) => (
        <div key={`e${i}`} className="w-7 h-7 rounded-full bg-white/5 border border-white/10" />
      ))}
    </div>
  );
}

function StatBox({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`flex flex-col items-center gap-0.5 py-2.5 px-1 rounded-xl ${highlight ? "bg-white/10" : "bg-white/5"}`}>
      <span className="text-lg font-black text-white leading-none" style={{ fontFamily: "var(--font-oswald)" }}>{value}</span>
      <span className="text-[9px] uppercase tracking-wider text-white/40 font-semibold">{label}</span>
    </div>
  );
}

export default function ProfilesPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);

  async function load() {
    setLoading(true);
    setLoadError(false);
    try {
      const res = await fetch("/api/profiles");
      const data = await res.json();
      setProfiles(Array.isArray(data) ? data : []);
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
        <div className="absolute -top-20 -left-20 w-[400px] h-[400px] rounded-full bg-indigo-600/10 blur-[120px]" />
        <div className="absolute top-60 -right-10 w-[300px] h-[300px] rounded-full bg-blue-600/8 blur-[90px]" />
        <div className="absolute bottom-20 left-1/3 w-[250px] h-[250px] rounded-full bg-purple-600/8 blur-[80px]" />
        <div className="absolute inset-0 opacity-[0.018]"
          style={{ backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
      </div>

      {/* Header */}
      <div className="relative pt-8 pb-5">
        <p className="text-[10px] uppercase tracking-[0.3em] text-indigo-400/80 font-bold mb-1.5">Career Stats</p>
        <h1 style={{ fontFamily: "var(--font-bebas)", letterSpacing: "0.04em", lineHeight: 1 }}
          className="text-[2.8rem] sm:text-[3.5rem] leading-none">
          <span className="bg-gradient-to-br from-indigo-300 to-blue-400 bg-clip-text text-transparent">Player</span>
          {" "}<span className="text-white">Profiles</span>
        </h1>
        <p className="text-gray-600 mt-1 text-xs">Career milestones from all matches</p>
        <div className="mt-5 h-px bg-gradient-to-r from-indigo-500/30 to-transparent" />
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-600">
          <div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-400 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm">Loading…</p>
        </div>
      ) : loadError ? (
        <div className="text-center py-16 text-gray-600 border border-red-500/10 rounded-2xl bg-red-500/[0.03]">
          <p className="font-semibold text-red-400">Failed to load profiles.</p>
          <button onClick={load} className="mt-3 text-xs text-gray-500 hover:text-gray-300 underline">Try again</button>
        </div>
      ) : profiles.length === 0 ? (
        <div className="text-center py-16 text-gray-600 border border-white/5 rounded-2xl bg-white/[0.02]">
          <p className="font-semibold">No players yet.</p>
        </div>
      ) : (
        <div className="relative grid sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-10">
          {profiles.map((p, idx) => {
            const theme = cardThemes[idx % cardThemes.length];
            const isOpen = expanded === p.id;
            return (
              <div key={p.id}
                className={`rounded-2xl border overflow-hidden transition-all duration-300 ${theme.border} bg-[#0d0d1a]`}
                style={{ boxShadow: isOpen ? `0 0 40px ${theme.glow}` : `0 0 0px transparent` }}>

                {/* Card banner */}
                <div className={`relative bg-gradient-to-br ${theme.banner} px-5 pt-6 pb-16 overflow-hidden`}>
                  {/* Background pattern */}
                  <div className="absolute inset-0 opacity-10"
                    style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "16px 16px" }} />
                  {/* Number watermark */}
                  <div className="absolute right-3 top-1 text-[7rem] font-black text-white/10 leading-none select-none"
                    style={{ fontFamily: "var(--font-bebas)" }}>{idx + 1}</div>
                  {/* Name */}
                  <p className="relative text-[10px] uppercase tracking-[0.2em] text-white/60 font-semibold mb-1"
                    style={{ fontFamily: "var(--font-oswald)" }}>
                    {p.matches} match{p.matches !== 1 ? "es" : ""}
                  </p>
                  <p className="relative text-2xl font-black text-white leading-tight"
                    style={{ fontFamily: "var(--font-rajdhani)" }}>
                    {p.name}
                  </p>
                </div>

                {/* Avatar overlapping banner */}
                <div className="relative px-5">
                  <div className="-mt-10 mb-3 flex items-end justify-between">
                    {p.photo ? (
                      <div className="w-20 h-20 rounded-full overflow-hidden ring-4 ring-[#0d0d1a] shadow-2xl"
                        style={{ boxShadow: `0 0 24px ${theme.glow}` }}>
                        <Image src={p.photo} alt={p.name} width={80} height={80} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${theme.banner} flex items-center justify-center font-black text-4xl text-white ring-4 ring-[#0d0d1a] shadow-2xl`}
                        style={{ fontFamily: "var(--font-bebas)", boxShadow: `0 0 24px ${theme.glow}` }}>
                        {p.name[0].toUpperCase()}
                      </div>
                    )}
                    {/* Hero stats */}
                    <div className="flex gap-2 mb-1">
                      <div className="text-center">
                        <p className={`text-3xl font-black leading-none ${theme.accent}`} style={{ fontFamily: "var(--font-oswald)" }}>{p.batting.runs}</p>
                        <p className="text-[9px] uppercase tracking-wider text-gray-600 font-semibold">Runs</p>
                      </div>
                      <div className="w-px bg-white/10 self-stretch mx-1" />
                      <div className="text-center">
                        <p className="text-3xl font-black leading-none text-purple-300" style={{ fontFamily: "var(--font-oswald)" }}>{p.bowling.wickets}</p>
                        <p className="text-[9px] uppercase tracking-wider text-gray-600 font-semibold">Wkts</p>
                      </div>
                    </div>
                  </div>

                  {/* Milestone badges */}
                  <div className="flex gap-2 flex-wrap mb-4">
                    {p.batting.hundreds > 0 && (
                      <span className="px-2.5 py-1 rounded-full bg-yellow-500/15 border border-yellow-500/25 text-yellow-300 text-[10px] font-bold uppercase tracking-wider">
                        {p.batting.hundreds} × 💯
                      </span>
                    )}
                    {p.batting.fifties > 0 && (
                      <span className="px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/25 text-amber-300 text-[10px] font-bold uppercase tracking-wider">
                        {p.batting.fifties} × 50
                      </span>
                    )}
                    {p.batting.sixes > 0 && (
                      <span className="px-2.5 py-1 rounded-full bg-red-500/15 border border-red-500/20 text-red-300 text-[10px] font-bold uppercase tracking-wider">
                        {p.batting.sixes} × 6️⃣
                      </span>
                    )}
                    {p.batting.bestScore && (
                      <span className="px-2.5 py-1 rounded-full bg-orange-500/15 border border-orange-500/25 text-orange-300 text-[10px] font-bold tracking-wider">
                        HS {p.batting.bestScore.runs}{p.batting.bestScore.notOut ? "*" : ""}
                      </span>
                    )}
                    {p.bowling.bestFigures && (
                      <span className="px-2.5 py-1 rounded-full bg-purple-500/15 border border-purple-500/25 text-purple-300 text-[10px] font-bold tracking-wider">
                        BB {p.bowling.bestFigures.wickets}/{p.bowling.bestFigures.runsConceded}
                      </span>
                    )}
                  </div>

                  {/* Form tracker */}
                  <FormDots form={p.recentForm} />

                  {/* Achievement badges */}
                  {p.badges.length > 0 && (
                    <div className="flex gap-1.5 flex-wrap mb-3">
                      {p.badges.map((b) => (
                        <span key={b.label} title={b.desc}
                          className="px-2 py-0.5 rounded-full bg-white/8 border border-white/15 text-white text-[10px] font-semibold cursor-default">
                          {b.icon} {b.label}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Expand button */}
                  <button onClick={() => setExpanded(isOpen ? null : p.id)}
                    className={`w-full py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all mb-4 ${isOpen ? "bg-white/10 text-white" : "bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white"}`}
                    style={{ fontFamily: "var(--font-oswald)" }}>
                    {isOpen ? "▲ Hide Stats" : "▼ Full Stats"}
                  </button>
                </div>

                {/* Expanded stats */}
                {isOpen && (
                  <div className="border-t border-white/8 px-5 pb-5 pt-4 space-y-5">
                    {/* Batting */}
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-orange-400 mb-2 flex items-center gap-2"
                        style={{ fontFamily: "var(--font-oswald)" }}>
                        🏏 Batting
                      </p>
                      <div className="grid grid-cols-4 gap-1.5">
                        <StatBox label="Inn" value={String(p.batting.innings)} />
                        <StatBox label="Runs" value={String(p.batting.runs)} highlight />
                        <StatBox label="Avg" value={fmtAvg(p.batting.avg)} />
                        <StatBox label="SR" value={fmt(p.batting.sr)} />
                        <StatBox label="100s" value={String(p.batting.hundreds)} highlight />
                        <StatBox label="50s" value={String(p.batting.fifties)} highlight />
                        <StatBox label="4s" value={String(p.batting.fours)} />
                        <StatBox label="6s" value={String(p.batting.sixes)} />
                        {p.batting.bestScore && (
                          <div className="col-span-4">
                            <StatBox label="Best Score (HS)" value={`${p.batting.bestScore.runs}${p.batting.bestScore.notOut ? "*" : ""}`} highlight />
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Bowling */}
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-purple-400 mb-2 flex items-center gap-2"
                        style={{ fontFamily: "var(--font-oswald)" }}>
                        🎯 Bowling
                      </p>
                      <div className="grid grid-cols-3 gap-1.5">
                        <StatBox label="Wkts" value={String(p.bowling.wickets)} highlight />
                        <StatBox label="Mdns" value={String(p.bowling.maidens)} />
                        <StatBox label="Overs" value={fmt(p.bowling.overs)} />
                        <StatBox label="Runs" value={String(p.bowling.runsConceded)} />
                        <StatBox label="Econ" value={p.bowling.overs > 0 ? fmt(p.bowling.economy) : "-"} />
                        <StatBox label="Avg" value={fmtAvg(p.bowling.avg)} />
                        {p.bowling.bestFigures && (
                          <div className="col-span-3">
                            <StatBox label="Best Figures (BB)" value={`${p.bowling.bestFigures.wickets}/${p.bowling.bestFigures.runsConceded}`} highlight />
                          </div>
                        )}
                      </div>
                    </div>
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
