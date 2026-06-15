"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Apartment { id: number; name: string; slug: string }

interface BattingRow {
  id: number; name: string; league: string; leagueSlug: string;
  matches: number; innings: number; runs: number; balls: number;
  fours: number; sixes: number; dismissals: number;
  avg: number | null; sr: number;
}

interface BowlingRow {
  id: number; name: string; league: string; leagueSlug: string;
  matches: number; innings: number; wickets: number; overs: number;
  runsConceded: number; maidens: number; economy: number; avg: number;
}

const LEAGUE_COLORS = [
  "bg-orange-500/20 text-orange-300 border-orange-500/30",
  "bg-purple-500/20 text-purple-300 border-purple-500/30",
  "bg-blue-500/20 text-blue-300 border-blue-500/30",
  "bg-green-500/20 text-green-300 border-green-500/30",
  "bg-pink-500/20 text-pink-300 border-pink-500/30",
  "bg-amber-500/20 text-amber-300 border-amber-500/30",
];

export default function SuperadminPage() {
  const router = useRouter();
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [tab, setTab] = useState<"batting" | "bowling">("batting");
  const [batting, setBatting] = useState<BattingRow[]>([]);
  const [bowling, setBowling] = useState<BowlingRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.ok ? r.json() : null).then((me) => {
      if (!me || me.role !== "superadmin") { router.replace("/unauthorized"); return; }
    });
    fetch("/api/apartments").then((r) => r.json()).then((d) => {
      if (Array.isArray(d)) setApartments(d);
    });
  }, [router]);

  function toggleApartment(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  async function fetchStats() {
    if (selected.size === 0) { setBatting([]); setBowling([]); return; }
    setLoading(true);
    const ids = [...selected].join(",");
    const [b, bw] = await Promise.all([
      fetch(`/api/superadmin/leaderboard?apartments=${ids}&type=batting`).then((r) => r.json()),
      fetch(`/api/superadmin/leaderboard?apartments=${ids}&type=bowling`).then((r) => r.json()),
    ]);
    setBatting(Array.isArray(b) ? b : []);
    setBowling(Array.isArray(bw) ? bw : []);
    setLoading(false);
  }

  useEffect(() => { fetchStats(); }, [selected]);

  const leagueColorMap = new Map(apartments.map((a, i) => [a.slug, LEAGUE_COLORS[i % LEAGUE_COLORS.length]]));

  return (
    <div className="relative -mt-6 -mx-4 px-4 pt-0 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 left-1/3 w-[500px] h-[300px] rounded-full bg-yellow-600/8 blur-[120px]" />
        <div className="absolute top-60 -right-10 w-[300px] h-[300px] rounded-full bg-orange-600/8 blur-[90px]" />
      </div>

      <div className="relative pt-8 pb-5">
        <p className="text-[10px] uppercase tracking-[0.3em] text-yellow-400/80 font-bold mb-1.5">Super Admin</p>
        <h1 style={{ fontFamily: "var(--font-bebas)", letterSpacing: "0.04em", lineHeight: 1 }}
          className="text-[2.8rem] sm:text-[3.5rem] leading-none">
          <span className="bg-gradient-to-br from-yellow-300 to-orange-400 bg-clip-text text-transparent">Cross-League</span>
          {" "}<span className="text-white">Stats</span>
        </h1>
        <p className="text-gray-600 mt-1 text-xs">Compare players across apartment leagues</p>
        <div className="mt-5 h-px bg-gradient-to-r from-yellow-500/30 to-transparent" />
      </div>

      {/* League selector */}
      <div className="mb-8">
        <p className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-3">Select Leagues</p>
        <div className="flex flex-wrap gap-2">
          {apartments.map((apt, aptIdx) => {
            const isOn = selected.has(apt.id);
            const initials = apt.name.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);
            const colorClass = LEAGUE_COLORS[aptIdx % LEAGUE_COLORS.length];
            return (
              <button key={apt.id} onClick={() => toggleApartment(apt.id)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                  isOn
                    ? "bg-yellow-500/20 border-yellow-500/50 text-yellow-300 shadow-[0_0_12px_rgba(234,179,8,0.2)]"
                    : "bg-white/5 border-white/10 text-gray-400 hover:border-white/20 hover:text-gray-200"
                }`}>
                <span className={`text-[10px] font-black w-6 h-6 rounded-md flex items-center justify-center ${isOn ? "bg-yellow-500/30 text-yellow-200" : colorClass}`}
                  style={{ fontFamily: "var(--font-bebas)" }}>
                  {initials}
                </span>
                {isOn && <span className="text-yellow-400 text-xs">✓</span>}
                {apt.name}
              </button>
            );
          })}
          <button onClick={() => setSelected(new Set(apartments.map((a) => a.id)))}
            className="px-4 py-2 rounded-xl border border-dashed border-white/20 text-gray-500 hover:text-gray-300 text-xs transition-colors">
            Select All
          </button>
          {selected.size > 0 && (
            <button onClick={() => setSelected(new Set())}
              className="px-4 py-2 rounded-xl border border-dashed border-red-500/20 text-red-500/60 hover:text-red-400 text-xs transition-colors">
              Clear
            </button>
          )}
        </div>
      </div>

      {selected.size === 0 ? (
        <div className="text-center py-20 text-gray-600">
          <div className="text-5xl mb-4">🏟️</div>
          <p className="font-semibold">Select at least one league to see stats</p>
        </div>
      ) : (
        <>
          {/* Tabs */}
          <div className="flex gap-1 mb-6 p-1 rounded-xl bg-white/5 border border-white/8 w-fit">
            {(["batting", "bowling"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${
                  tab === t ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30" : "text-gray-500 hover:text-gray-300"
                }`}>
                {t === "batting" ? "🟠 Orange Cap" : "🟣 Purple Cap"}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-16 text-gray-600">
              <div className="text-4xl mb-3 animate-pulse">⏳</div>
              <p>Loading cross-league stats…</p>
            </div>
          ) : tab === "batting" ? (
            <BattingTable rows={batting} leagueColorMap={leagueColorMap} />
          ) : (
            <BowlingTable rows={bowling} leagueColorMap={leagueColorMap} />
          )}
        </>
      )}
    </div>
  );
}

function BattingTable({ rows, leagueColorMap }: { rows: BattingRow[]; leagueColorMap: Map<string, string> }) {
  if (rows.length === 0) return <p className="text-center py-12 text-gray-600">No batting data for selected leagues.</p>;
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden mb-10">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-gray-500 font-bold w-8">#</th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-gray-500 font-bold">Player</th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-gray-500 font-bold">League</th>
              <th className="text-right px-4 py-3 text-xs uppercase tracking-wider text-gray-500 font-bold">Mat</th>
              <th className="text-right px-4 py-3 text-xs uppercase tracking-wider text-gray-500 font-bold">Inn</th>
              <th className="text-right px-4 py-3 text-xs uppercase tracking-wider text-orange-400 font-bold">Runs</th>
              <th className="text-right px-4 py-3 text-xs uppercase tracking-wider text-gray-500 font-bold">Avg</th>
              <th className="text-right px-4 py-3 text-xs uppercase tracking-wider text-gray-500 font-bold">SR</th>
              <th className="text-right px-4 py-3 text-xs uppercase tracking-wider text-gray-500 font-bold">4s</th>
              <th className="text-right px-4 py-3 text-xs uppercase tracking-wider text-gray-500 font-bold">6s</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p, i) => {
              const isTop = i === 0;
              const leagueColor = leagueColorMap.get(p.leagueSlug) ?? LEAGUE_COLORS[0];
              return (
                <tr key={`${p.leagueSlug}-${p.id}`}
                  className={`border-b border-white/5 transition-colors hover:bg-white/5 ${isTop ? "bg-orange-500/5" : ""}`}>
                  <td className="px-4 py-3 text-gray-600 text-xs font-mono">
                    {isTop ? <span className="text-orange-400 font-black">🟠</span> : i + 1}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`font-semibold ${isTop ? "text-orange-300" : "text-white"}`}>{p.name}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${leagueColor}`}>{p.league}</span>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-400 text-xs">{p.matches}</td>
                  <td className="px-4 py-3 text-right text-gray-400 text-xs">{p.innings}</td>
                  <td className={`px-4 py-3 text-right font-black text-base ${isTop ? "text-orange-300" : "text-white"}`}>{p.runs}</td>
                  <td className="px-4 py-3 text-right text-gray-300 text-xs font-mono">
                    {p.avg === null ? "∞" : p.avg === 0 ? "—" : p.avg.toFixed(1)}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-400 text-xs font-mono">{p.sr.toFixed(1)}</td>
                  <td className="px-4 py-3 text-right text-gray-400 text-xs">{p.fours}</td>
                  <td className="px-4 py-3 text-right text-gray-400 text-xs">{p.sixes}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BowlingTable({ rows, leagueColorMap }: { rows: BowlingRow[]; leagueColorMap: Map<string, string> }) {
  if (rows.length === 0) return <p className="text-center py-12 text-gray-600">No bowling data for selected leagues.</p>;
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden mb-10">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-gray-500 font-bold w-8">#</th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-gray-500 font-bold">Player</th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-gray-500 font-bold">League</th>
              <th className="text-right px-4 py-3 text-xs uppercase tracking-wider text-gray-500 font-bold">Mat</th>
              <th className="text-right px-4 py-3 text-xs uppercase tracking-wider text-gray-500 font-bold">Inn</th>
              <th className="text-right px-4 py-3 text-xs uppercase tracking-wider text-purple-400 font-bold">Wkts</th>
              <th className="text-right px-4 py-3 text-xs uppercase tracking-wider text-gray-500 font-bold">Overs</th>
              <th className="text-right px-4 py-3 text-xs uppercase tracking-wider text-gray-500 font-bold">Econ</th>
              <th className="text-right px-4 py-3 text-xs uppercase tracking-wider text-gray-500 font-bold">Avg</th>
              <th className="text-right px-4 py-3 text-xs uppercase tracking-wider text-gray-500 font-bold">Mdn</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p, i) => {
              const isTop = i === 0;
              const leagueColor = leagueColorMap.get(p.leagueSlug) ?? LEAGUE_COLORS[0];
              return (
                <tr key={`${p.leagueSlug}-${p.id}`}
                  className={`border-b border-white/5 transition-colors hover:bg-white/5 ${isTop ? "bg-purple-500/5" : ""}`}>
                  <td className="px-4 py-3 text-gray-600 text-xs font-mono">
                    {isTop ? <span className="text-purple-400 font-black">🟣</span> : i + 1}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`font-semibold ${isTop ? "text-purple-300" : "text-white"}`}>{p.name}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${leagueColor}`}>{p.league}</span>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-400 text-xs">{p.matches}</td>
                  <td className="px-4 py-3 text-right text-gray-400 text-xs">{p.innings}</td>
                  <td className={`px-4 py-3 text-right font-black text-base ${isTop ? "text-purple-300" : "text-white"}`}>{p.wickets}</td>
                  <td className="px-4 py-3 text-right text-gray-400 text-xs font-mono">{p.overs.toFixed(1)}</td>
                  <td className="px-4 py-3 text-right text-gray-300 text-xs font-mono">{p.economy.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right text-gray-400 text-xs font-mono">
                    {p.avg > 0 ? p.avg.toFixed(1) : "—"}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-400 text-xs">{p.maidens}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
