import { getRivalries } from "@/lib/queries";

export default async function RivalsPage() {
  const { favouriteVictims, nemeses } = await getRivalries(1);
  const empty = favouriteVictims.length === 0 && nemeses.length === 0;

  return (
    <div className="relative -mt-6 -mx-4 px-4 pt-0 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-red-600/12 blur-[140px]" />
        <div className="absolute top-60 -left-20 w-[320px] h-[320px] rounded-full bg-orange-600/8 blur-[100px]" />
      </div>

      <div className="relative pt-8 pb-5">
        <p className="text-[10px] uppercase tracking-[0.3em] text-red-400/80 font-bold mb-1.5">Head to Head</p>
        <h1 style={{ fontFamily: "var(--font-bebas)", letterSpacing: "0.04em", lineHeight: 1 }}
          className="text-[2.8rem] sm:text-[3.5rem] leading-none">
          <span className="bg-gradient-to-br from-red-300 to-orange-400 bg-clip-text text-transparent">Rivals</span>
          {" "}<span className="text-white">& Nemeses</span>
        </h1>
        <p className="text-xs text-gray-600 mt-2">Dismissal-based rivalries · needs ≥2 dismissals between the same pair</p>
      </div>

      {empty ? (
        <div className="text-center py-20 text-gray-600 border border-white/5 rounded-2xl bg-white/[0.02]">
          <div className="text-4xl mb-3">⚔️</div>
          <p className="font-semibold">No rivalries yet.</p>
          <p className="text-sm mt-1">A pair needs at least 2 dismissals to appear here.</p>
        </div>
      ) : (
        <div className="relative grid sm:grid-cols-2 gap-6 pb-10">
          {/* Favourite Victims */}
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-orange-400 font-bold mb-3">🎯 Favourite Victims</p>
            {favouriteVictims.length === 0 ? (
              <p className="text-sm text-gray-600 py-4">Not enough data yet.</p>
            ) : (
              <div className="space-y-2">
                {favouriteVictims.map((r, i) => (
                  <div key={`${r.bowler}-${r.victim}`}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl bg-orange-500/[0.06] border border-orange-500/15">
                    <div className="w-7 h-7 rounded-full bg-orange-500/20 flex items-center justify-center text-xs font-black text-orange-300 shrink-0"
                      style={{ fontFamily: "var(--font-bebas)" }}>
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-bold truncate" style={{ fontFamily: "var(--font-rajdhani)", fontSize: "1rem" }}>{r.bowler}</p>
                      <p className="text-[11px] text-gray-500 truncate">dismisses <span className="text-orange-300 font-semibold">{r.victim}</span></p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xl font-black text-orange-300" style={{ fontFamily: "var(--font-oswald)" }}>{r.count}×</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Nemeses */}
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-red-400 font-bold mb-3">😱 Nemeses</p>
            {nemeses.length === 0 ? (
              <p className="text-sm text-gray-600 py-4">Not enough data yet.</p>
            ) : (
              <div className="space-y-2">
                {nemeses.map((r, i) => (
                  <div key={`${r.batter}-${r.nemesis}`}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/[0.06] border border-red-500/15">
                    <div className="w-7 h-7 rounded-full bg-red-500/20 flex items-center justify-center text-xs font-black text-red-300 shrink-0"
                      style={{ fontFamily: "var(--font-bebas)" }}>
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-bold truncate" style={{ fontFamily: "var(--font-rajdhani)", fontSize: "1rem" }}>{r.batter}</p>
                      <p className="text-[11px] text-gray-500 truncate">always falls to <span className="text-red-300 font-semibold">{r.nemesis}</span></p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xl font-black text-red-300" style={{ fontFamily: "var(--font-oswald)" }}>{r.count}×</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
