import { Suspense } from "react";
import LeaderboardTable from "@/components/LeaderboardTable";
import FormatFilter from "@/components/FormatFilter";
import { getBattingLeaderboard } from "@/lib/queries";
import { getApartmentOrNotFound } from "@/lib/apartment";

const columns = [
  { key: "matches", label: "M" },
  { key: "innings", label: "Inn" },
  { key: "runs", label: "Runs" },
  { key: "avg", label: "Avg", format: (v: number | null) => (v === null ? "∞" : v === 0 ? "0.0" : v.toFixed(1)) },
  { key: "sr", label: "SR", format: (v: number | null) => (v ?? 0).toFixed(1) },
  { key: "fours", label: "4s" },
  { key: "sixes", label: "6s" },
];

export default async function SlugOrangeCapPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ format?: string }>;
}) {
  const { slug } = await params;
  const { format } = await searchParams;
  const apartment = await getApartmentOrNotFound(slug);
  const rows = await getBattingLeaderboard(apartment.id, format);

  return (
    <div className="relative -mt-6 -mx-4 px-4 pt-0 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-orange-600/15 blur-[120px]" />
        <div className="absolute top-60 -left-20 w-[350px] h-[350px] rounded-full bg-amber-500/10 blur-[90px]" />
        <div className="absolute inset-0 opacity-[0.02]"
          style={{ backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
      </div>

      <div className="relative pt-10 pb-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <p className="text-xs uppercase tracking-[0.3em] text-orange-500 font-bold mb-2" style={{ fontFamily: "var(--font-oswald)" }}>
              Batting Leaderboard
            </p>
            <h1 style={{ fontFamily: "var(--font-bebas)", letterSpacing: "0.05em", lineHeight: 1 }}
              className="text-[5rem] sm:text-[7rem] leading-none">
              <span className="bg-gradient-to-br from-orange-300 via-orange-400 to-yellow-500 bg-clip-text text-transparent">Orange</span>
              <br />
              <span className="text-white">Cap</span>
            </h1>
            <p className="text-gray-500 mt-2 text-sm" style={{ fontFamily: "var(--font-rajdhani)", fontWeight: 600 }}>
              Top run-scorers of the season — ranked by total runs
            </p>
          </div>
          <div className="text-[7rem] sm:text-[9rem] leading-none select-none shrink-0 self-center"
            style={{ filter: "sepia(1) saturate(4) hue-rotate(340deg) brightness(1.1)", opacity: 0.35 }}>
            🧢
          </div>
        </div>
        <div className="mt-6 h-px bg-gradient-to-r from-orange-500/50 via-orange-500/20 to-transparent" />
      </div>

      <div className="relative mb-6">
        <Suspense>
          <FormatFilter basePath={`/${slug}/stats`} />
        </Suspense>
      </div>

      <div className="relative">
        <LeaderboardTable
          rows={rows}
          columns={columns}
          accentColor="#c2410c"
          accentColorLight="#9a3412"
          rankLabel="Batsman"
          primaryKey="runs"
        />
      </div>
    </div>
  );
}
