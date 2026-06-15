import { getStandings } from "@/lib/queries";

export default async function StandingsPage() {
  const rows = await getStandings(1);

  return (
    <div className="relative -mt-6 -mx-4 px-4 pt-0 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-cyan-600/10 blur-[140px]" />
        <div className="absolute top-60 -left-20 w-[320px] h-[320px] rounded-full bg-blue-600/8 blur-[100px]" />
      </div>

      <div className="relative pt-8 pb-5">
        <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400/80 font-bold mb-1.5">Win / Loss</p>
        <h1 style={{ fontFamily: "var(--font-bebas)", letterSpacing: "0.04em", lineHeight: 1 }}
          className="text-[2.8rem] sm:text-[3.5rem] leading-none">
          <span className="bg-gradient-to-br from-cyan-300 to-blue-400 bg-clip-text text-transparent">Player</span>
          {" "}<span className="text-white">Standings</span>
        </h1>
        <p className="text-xs text-gray-600 mt-2">Individual win/loss records across all matches</p>
      </div>

      {rows.length === 0 ? (
        <div className="text-center py-20 text-gray-600 border border-white/5 rounded-2xl bg-white/[0.02]">
          <div className="text-4xl mb-3">📊</div>
          <p className="font-semibold">No completed matches yet.</p>
        </div>
      ) : (
        <div className="relative pb-10">
          {rows.length > 0 && (
            <div className="mb-5 flex items-center gap-4 px-4 py-3.5 rounded-xl bg-cyan-500/[0.07] border border-cyan-500/15">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center font-black text-lg text-white shrink-0"
                style={{ fontFamily: "var(--font-bebas)" }}>
                {rows[0].name[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[9px] uppercase tracking-widest text-cyan-400/70 font-bold">Most Wins</p>
                <p className="font-black text-white truncate" style={{ fontFamily: "var(--font-rajdhani)", fontSize: "1.05rem" }}>{rows[0].name}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-2xl font-black text-cyan-300" style={{ fontFamily: "var(--font-oswald)" }}>{rows[0].W}W</p>
                <p className="text-[9px] text-gray-600 uppercase tracking-wider">{rows[0].winPct.toFixed(0)}% win rate</p>
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-white/8 overflow-hidden bg-white/[0.02]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/8">
                  <th className="text-left px-4 py-3 text-[10px] uppercase tracking-wider text-gray-600 font-bold">Player</th>
                  <th className="text-center px-3 py-3 text-[10px] uppercase tracking-wider text-gray-600 font-bold">M</th>
                  <th className="text-center px-3 py-3 text-[10px] uppercase tracking-wider text-green-600 font-bold">W</th>
                  <th className="text-center px-3 py-3 text-[10px] uppercase tracking-wider text-red-600 font-bold">L</th>
                  <th className="text-center px-3 py-3 text-[10px] uppercase tracking-wider text-yellow-600 font-bold">T</th>
                  <th className="text-center px-3 py-3 text-[10px] uppercase tracking-wider text-gray-600 font-bold">D</th>
                  <th className="text-center px-3 py-3 text-[10px] uppercase tracking-wider text-cyan-400 font-bold">Win%</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.id} className={`border-t border-white/5 transition-colors hover:bg-white/[0.03] ${i === 0 ? "bg-cyan-500/[0.04]" : ""}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <span className="text-[10px] text-gray-600 font-bold w-4 text-right shrink-0">{i + 1}</span>
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-500/30 to-blue-600/30 flex items-center justify-center text-xs font-black text-cyan-300 shrink-0"
                          style={{ fontFamily: "var(--font-bebas)" }}>
                          {r.name[0].toUpperCase()}
                        </div>
                        <span className="font-bold text-white" style={{ fontFamily: "var(--font-rajdhani)" }}>{r.name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-center text-gray-500 font-medium">{r.M}</td>
                    <td className="px-3 py-3 text-center font-bold text-green-400" style={{ fontFamily: "var(--font-oswald)" }}>{r.W}</td>
                    <td className="px-3 py-3 text-center font-bold text-red-400" style={{ fontFamily: "var(--font-oswald)" }}>{r.L}</td>
                    <td className="px-3 py-3 text-center font-medium text-yellow-500">{r.T}</td>
                    <td className="px-3 py-3 text-center font-medium text-gray-600">{r.D}</td>
                    <td className="px-3 py-3 text-center font-bold text-cyan-300" style={{ fontFamily: "var(--font-oswald)" }}>{r.winPct.toFixed(0)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
