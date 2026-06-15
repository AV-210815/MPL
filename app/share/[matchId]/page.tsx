import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";

function formatDismissal(d: string | null | undefined, notOut: boolean): string | null {
  if (notOut) return "not out";
  if (!d) return null;
  if (d === "obs") return "obstructing";
  if (d === "hb") return "handled ball";
  if (d === "ret out" || d === "ret") return "retired out";
  if (d === "ro") return "run out";
  if (d.startsWith("ro ")) return `run out (${d.slice(3)})`;
  if (d === "hw") return "hit wicket";
  if (d.startsWith("hw ")) return `hit wkt b ${d.slice(3)}`;
  if (d === "lbw") return "lbw";
  if (d.startsWith("lbw ")) return `lbw b ${d.slice(4)}`;
  return d;
}

interface Props { params: Promise<{ matchId: string }> }

export default async function SharePage({ params }: Props) {
  const { matchId } = await params;
  const id = Number(matchId);
  if (isNaN(id)) notFound();

  const match = await prisma.match.findUnique({
    where: { id },
    include: {
      potm: { select: { id: true, name: true } },
      batting: { include: { player: true }, orderBy: [{ innings: "asc" }, { id: "asc" }] },
      bowling: { include: { player: true }, orderBy: [{ innings: "asc" }, { id: "asc" }] },
    },
  });
  if (!match) notFound();

  // Merge dismissals
  const ids = match.batting.map((b) => b.id);
  if (ids.length > 0) {
    const rows = await prisma.$queryRawUnsafe<{ id: number; dismissal: string | null }[]>(
      `SELECT id, dismissal FROM BattingStat WHERE id IN (${ids.join(",")})`
    );
    const map = new Map(rows.map((r) => [r.id, r.dismissal]));
    for (const b of match.batting) { (b as any).dismissal = map.get(b.id) ?? null; }
  }

  const inningsNums = Array.from(new Set([
    ...match.batting.map((b) => b.innings),
    ...match.bowling.map((b) => b.innings),
  ])).sort();

  const dateStr = new Date(match.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="min-h-screen bg-[#060610] pb-16">
      {/* Back link */}
      <div className="px-4 pt-4">
        <Link href="/matches" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">← Back to Matches</Link>
      </div>

      {/* Match header card */}
      <div className="px-4 mt-4 mb-6">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-gray-600 font-bold mb-1">{match.format} · {dateStr}</p>
              <h1 className="text-2xl font-black text-white leading-tight" style={{ fontFamily: "var(--font-bebas)", letterSpacing: "0.04em" }}>
                {match.label ?? `Match #${match.id}`}
              </h1>
              <p className="text-sm text-gray-400 mt-0.5">
                <span className="text-blue-300 font-semibold">{match.team1Name}</span>
                <span className="text-gray-600 mx-2">vs</span>
                <span className="text-green-300 font-semibold">{match.team2Name}</span>
              </p>
            </div>
            {match.result && (
              <div className="text-right shrink-0">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold">
                  🏆 {match.result}
                </div>
              </div>
            )}
          </div>
          {match.potm && (
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 text-xs font-semibold">
              ⭐ POTM: {match.potm.name}
            </div>
          )}
        </div>
      </div>

      {/* Innings */}
      <div className="px-4 space-y-6">
        {inningsNums.map((n) => {
          const battingStats = match.batting.filter((b) => b.innings === n);
          const bowlingStats = match.bowling.filter((b) => b.innings === n);
          const batTeam = battingStats[0]?.team ?? 1;
          const bowlTeam = bowlingStats[0]?.team ?? 2;
          const batName = batTeam === 1 ? match.team1Name : match.team2Name;
          const bowlName = bowlTeam === 1 ? match.team1Name : match.team2Name;
          const totalRuns = battingStats.filter((b) => !b.dnb).reduce((s, b) => s + b.runs, 0);
          const totalWkts = battingStats.filter((b) => !b.notOut && !b.dnb).length;

          return (
            <div key={n}>
              <div className="flex items-center gap-2 mb-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600">Innings {n}</p>
                <div className="flex-1 h-px bg-white/5" />
                <p className="text-sm font-black text-white" style={{ fontFamily: "var(--font-oswald)" }}>{totalRuns}/{totalWkts}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                {/* Batting */}
                <div className="rounded-xl bg-orange-500/5 border border-orange-500/10 overflow-hidden">
                  <div className="px-3 py-2 border-b border-orange-500/10">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-orange-400">🏏 {batName} — Batting</p>
                  </div>
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-gray-600">
                        <th className="text-left px-3 py-1.5">Player</th>
                        <th className="text-center px-2 py-1.5">R</th>
                        <th className="text-center px-2 py-1.5">B</th>
                        <th className="text-center px-2 py-1.5">4s</th>
                        <th className="text-center px-2 py-1.5">6s</th>
                      </tr>
                    </thead>
                    <tbody>
                      {battingStats.filter((b) => !b.dnb).map((b) => {
                        const dis = formatDismissal((b as any).dismissal, b.notOut);
                        return (
                          <tr key={b.player.id} className={`border-t border-white/5 ${match.potm?.id === b.player.id ? "bg-yellow-500/5" : ""}`}>
                            <td className="px-3 py-2 font-medium">
                              <span className={match.potm?.id === b.player.id ? "text-yellow-300" : "text-white"}>
                                {match.potm?.id === b.player.id && "⭐ "}{b.player.name}
                              </span>
                              {dis && (
                                <span className={`block text-[10px] font-semibold mt-0.5 ${b.notOut ? "text-green-400" : "text-red-400"}`}>
                                  {dis}
                                </span>
                              )}
                            </td>
                            <td className="px-2 py-2 text-center font-black text-orange-300 text-sm" style={{ fontFamily: "var(--font-oswald)" }}>
                              {b.runs}{b.notOut ? "*" : ""}
                            </td>
                            <td className="px-2 py-2 text-center text-gray-500">{b.balls}</td>
                            <td className="px-2 py-2 text-center text-gray-500">{b.fours}</td>
                            <td className="px-2 py-2 text-center text-gray-500">{b.sixes}</td>
                          </tr>
                        );
                      })}
                      {battingStats.filter((b) => b.dnb).map((b) => (
                        <tr key={b.player.id} className="border-t border-white/5 opacity-30">
                          <td className="px-3 py-2 text-white">{b.player.name}</td>
                          <td className="px-2 py-2 text-center text-gray-600" colSpan={4}>DNB</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Bowling */}
                <div className="rounded-xl bg-purple-500/5 border border-purple-500/10 overflow-hidden">
                  <div className="px-3 py-2 border-b border-purple-500/10">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-purple-400">🎯 {bowlName} — Bowling</p>
                  </div>
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-gray-600">
                        <th className="text-left px-3 py-1.5">Player</th>
                        <th className="text-center px-2 py-1.5">W</th>
                        <th className="text-center px-2 py-1.5">Ov</th>
                        <th className="text-center px-2 py-1.5">R</th>
                        <th className="text-center px-2 py-1.5">Mdn</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bowlingStats.map((b) => (
                        <tr key={b.player.id} className="border-t border-white/5">
                          <td className="px-3 py-2 text-white font-medium">{b.player.name}</td>
                          <td className="px-2 py-2 text-center font-black text-purple-300 text-sm" style={{ fontFamily: "var(--font-oswald)" }}>{b.wickets}</td>
                          <td className="px-2 py-2 text-center text-gray-500">{b.overs}</td>
                          <td className="px-2 py-2 text-center text-gray-500">{b.runsConceded}</td>
                          <td className="px-2 py-2 text-center text-gray-500">{b.maidens}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer tag */}
      <div className="text-center mt-10">
        <p className="text-[10px] text-gray-700 tracking-[0.3em] uppercase font-semibold" style={{ fontFamily: "var(--font-oswald)" }}>
          🏏 MPL · Maple Premier League
        </p>
      </div>
    </div>
  );
}
