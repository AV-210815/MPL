import { Suspense } from "react";
import LeaderboardTable from "@/components/LeaderboardTable";
import FormatFilter from "@/components/FormatFilter";
import { getBowlingLeaderboard } from "@/lib/queries";

const columns = [
  { key: "matches", label: "M" },
  { key: "innings", label: "Inn" },
  { key: "wickets", label: "Wkts" },
  { key: "overs", label: "Ovrs", format: (v: number | null) => (v ?? 0).toFixed(1) },
  { key: "runsConceded", label: "Runs" },
  { key: "avg", label: "Avg", format: (v: number | null) => (!v ? "-" : v.toFixed(1)) },
  { key: "economy", label: "Econ", format: (v: number | null) => (v ?? 0).toFixed(2) },
  { key: "maidens", label: "Mdn" },
];

export default async function PurpleCapPage({ searchParams }: { searchParams: Promise<{ format?: string }> }) {
  const { format } = await searchParams;
  const rows = await getBowlingLeaderboard(format);

  return (
    <div className="relative -mt-6 -mx-4 px-4 pt-0 overflow-hidden">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-[400px] h-[400px] rounded-full bg-purple-600/12 blur-[100px]" />
        <div className="absolute top-40 -left-20 w-[300px] h-[300px] rounded-full bg-violet-500/8 blur-[80px]" />
      </div>

      {/* Header */}
      <div className="relative pt-10 pb-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <p className="text-xs uppercase tracking-[0.25em] text-purple-400 font-bold mb-1">Bowling Leaderboard</p>
            <h1 className="text-[5rem] sm:text-[7rem] leading-none bg-gradient-to-br from-purple-300 via-purple-400 to-blue-400 bg-clip-text text-transparent"
              style={{ fontFamily: "var(--font-bebas)", letterSpacing: "0.05em", lineHeight: 1 }}>
              Purple<br /><span className="text-white">Cap</span>
            </h1>
            <p className="text-gray-500 mt-2 text-sm" style={{ fontFamily: "var(--font-rajdhani)", fontWeight: 600 }}>
              Top wicket takers of the season — ranked by total wickets
            </p>
          </div>
          {/* Purple cap decoration */}
          <div className="text-[7rem] sm:text-[9rem] leading-none select-none shrink-0 self-center"
            style={{ filter: "sepia(1) saturate(5) hue-rotate(220deg) brightness(0.9)", opacity: 0.35 }}>
            🧢
          </div>
        </div>
        <div className="mt-6 h-px bg-gradient-to-r from-purple-500/50 via-purple-500/20 to-transparent" />
      </div>

      {/* Format filter */}
      <div className="relative mb-6">
        <Suspense>
          <FormatFilter basePath="/bowling" />
        </Suspense>
      </div>

      {/* Table */}
      <div className="relative">
        <LeaderboardTable
          rows={rows}
          columns={columns}
          accentColor="#6b21a8"
          accentColorLight="#581c87"
          rankLabel="Bowler"
          primaryKey="wickets"
        />
      </div>
    </div>
  );
}
