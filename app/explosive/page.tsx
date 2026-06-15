import { Suspense } from "react";
import LeaderboardTable from "@/components/LeaderboardTable";
import FormatFilter from "@/components/FormatFilter";
import SeasonFilter from "@/components/SeasonFilter";
import { getExplosiveLeaderboard, getSeasons } from "@/lib/queries";

const columns = [
  { key: "matches", label: "M" },
  { key: "innings", label: "Inn" },
  { key: "boundaries", label: "Boundaries" },
  { key: "fours", label: "4s" },
  { key: "sixes", label: "6s" },
  { key: "boundaryRuns", label: "Boundary Runs" },
  { key: "boundaryPct", label: "Boundary %", format: (v: number | null) => `${(v ?? 0).toFixed(1)}%` },
  { key: "runs", label: "Runs" },
];

export default async function ExplosivePage({ searchParams }: { searchParams: Promise<{ format?: string; season?: string }> }) {
  const { format, season } = await searchParams;
  const [rows, seasons] = await Promise.all([getExplosiveLeaderboard(1, format, season), getSeasons(1)]);

  return (
    <div className="relative -mt-6 -mx-4 px-4 pt-0 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-red-600/12 blur-[140px]" />
        <div className="absolute top-60 -left-20 w-[320px] h-[320px] rounded-full bg-orange-600/8 blur-[100px]" />
      </div>

      {/* Compact header row */}
      <div className="relative pt-8 pb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-red-400/80 font-bold mb-1.5">Boundary Kings</p>
          <h1 style={{ fontFamily: "var(--font-bebas)", letterSpacing: "0.04em", lineHeight: 1 }}
            className="text-[2.8rem] sm:text-[3.5rem] leading-none">
            <span className="bg-gradient-to-br from-red-300 to-orange-400 bg-clip-text text-transparent">Most</span>
            {" "}<span className="text-white">Explosive</span>
          </h1>
        </div>
        <div className="flex flex-col gap-2 pt-1 items-end shrink-0">
          <Suspense><FormatFilter basePath="/explosive" /></Suspense>
          <Suspense><SeasonFilter basePath="/explosive" seasons={seasons} /></Suspense>
        </div>
      </div>

      {/* Top player strip */}
      {rows.length > 0 && (
        <div className="relative mb-5 flex items-center gap-4 px-4 py-3.5 rounded-xl bg-red-500/[0.07] border border-red-500/15">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center font-black text-lg text-white shrink-0"
            style={{ fontFamily: "var(--font-bebas)" }}>
            {String(rows[0].name)[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[9px] uppercase tracking-widest text-red-400/70 font-bold">Most Explosive</p>
            <p className="font-black text-white truncate" style={{ fontFamily: "var(--font-rajdhani)", fontSize: "1.05rem" }}>{rows[0].name as string}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-2xl font-black text-red-300" style={{ fontFamily: "var(--font-oswald)" }}>{rows[0].boundaries as number}</p>
            <p className="text-[9px] text-gray-600 uppercase tracking-wider">boundaries</p>
          </div>
        </div>
      )}

      <div className="relative">
        <LeaderboardTable
          rows={rows}
          columns={columns}
          accentColor="#b91c1c"
          accentColorLight="#991b1b"
          rankLabel="Player"
          primaryKey="boundaries"
        />
      </div>
    </div>
  );
}
