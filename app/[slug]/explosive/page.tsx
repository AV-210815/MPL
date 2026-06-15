import { Suspense } from "react";
import LeaderboardTable from "@/components/LeaderboardTable";
import FormatFilter from "@/components/FormatFilter";
import { getExplosiveLeaderboard } from "@/lib/queries";
import { getApartmentOrNotFound } from "@/lib/apartment";

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

export default async function SlugExplosivePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ format?: string }>;
}) {
  const { slug } = await params;
  const { format } = await searchParams;
  const apartment = await getApartmentOrNotFound(slug);
  const rows = await getExplosiveLeaderboard(apartment.id, format);

  return (
    <div className="relative -mt-6 -mx-4 px-4 pt-0 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-10 w-[420px] h-[420px] rounded-full bg-red-600/12 blur-[110px]" />
        <div className="absolute top-60 -left-20 w-[320px] h-[320px] rounded-full bg-orange-600/10 blur-[90px]" />
      </div>

      <div className="relative pt-10 pb-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <p className="text-xs uppercase tracking-[0.25em] text-red-400 font-bold mb-1">Boundary Kings</p>
            <h1 className="text-[5rem] sm:text-[7rem] leading-none bg-gradient-to-br from-red-300 via-orange-400 to-yellow-300 bg-clip-text text-transparent"
              style={{ fontFamily: "var(--font-bebas)", letterSpacing: "0.05em", lineHeight: 1 }}>
              Most<br />Explosive<br /><span className="text-white">Player</span>
            </h1>
            <p className="text-gray-500 mt-2 text-sm" style={{ fontFamily: "var(--font-rajdhani)", fontWeight: 600 }}>
              Ranked by total boundaries (4s + 6s) hit
            </p>
          </div>
          <div className="text-[7rem] sm:text-[9rem] leading-none select-none shrink-0 self-center opacity-35">💥</div>
        </div>
        <div className="mt-6 h-px bg-gradient-to-r from-red-500/50 via-red-500/20 to-transparent" />
      </div>

      {rows.length > 0 && (
        <div className="relative mb-6 rounded-2xl border border-red-500/20 bg-gradient-to-r from-red-500/10 via-orange-500/8 to-transparent overflow-hidden">
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-8xl opacity-10 select-none">💥</div>
          <div className="px-5 py-4 flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center font-black text-2xl text-white shrink-0 shadow-[0_0_24px_rgba(239,68,68,0.4)]"
              style={{ fontFamily: "var(--font-bebas)" }}>
              {String(rows[0].name)[0].toUpperCase()}
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-red-400 font-bold">💥 Most Explosive</p>
              <p className="font-black text-white text-2xl leading-tight" style={{ fontFamily: "var(--font-rajdhani)" }}>{rows[0].name}</p>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="text-sm text-gray-400">
                  <span className="text-yellow-300 font-bold text-lg" style={{ fontFamily: "var(--font-bebas)" }}>{rows[0].boundaries}</span> boundaries
                </span>
                <span className="text-gray-700">·</span>
                <span className="text-sm text-gray-400"><span className="text-blue-300 font-semibold">{rows[0].fours}</span> fours</span>
                <span className="text-gray-700">·</span>
                <span className="text-sm text-gray-400"><span className="text-purple-300 font-semibold">{rows[0].sixes}</span> sixes</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="relative mb-6">
        <Suspense>
          <FormatFilter basePath={`/${slug}/explosive`} />
        </Suspense>
      </div>

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
