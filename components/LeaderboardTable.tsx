type Column = { key: string; label: string; format?: (v: number | null) => string };
type Row = Record<string, string | number | boolean | null>;

interface Props {
  rows: Row[];
  columns: Column[];
  accentColor: string;
  accentColorLight: string;
  rankLabel: string;
  primaryKey: string; // the "hero" stat column key
}

function fmt(v: number | null, format?: (v: number | null) => string) {
  if (format) return format(v);
  if (v === null) return "∞";
  return Number.isFinite(v) ? String(v) : "-";
}

const medals = ["🥇", "🥈", "🥉"];
const podiumOrder = [1, 0, 2]; // visual left→right: 2nd | 1st | 3rd

const podiumCardBg = [
  "bg-gradient-to-b from-yellow-500/15 via-yellow-500/8 to-transparent border-yellow-500/30",
  "bg-gradient-to-b from-gray-400/10 via-gray-400/5 to-transparent border-gray-400/20",
  "bg-gradient-to-b from-amber-700/12 via-amber-700/6 to-transparent border-amber-700/22",
];
const podiumPlatform = [
  { height: "h-24 sm:h-28", bg: "bg-gradient-to-b from-yellow-500/50 via-yellow-600/30 to-yellow-700/15", border: "border-t-2 border-yellow-400/70", label: "1ST", labelColor: "text-yellow-300/80", glow: "shadow-[0_-4px_24px_rgba(234,179,8,0.25)]" },
  { height: "h-16 sm:h-20", bg: "bg-gradient-to-b from-gray-400/35 via-gray-500/20 to-gray-600/10",   border: "border-t-2 border-gray-300/50",   label: "2ND", labelColor: "text-gray-300/70",   glow: "shadow-[0_-3px_16px_rgba(156,163,175,0.18)]" },
  { height: "h-10 sm:h-14", bg: "bg-gradient-to-b from-amber-700/40 via-amber-800/22 to-amber-900/10", border: "border-t-2 border-amber-600/55",  label: "3RD", labelColor: "text-amber-500/70",  glow: "shadow-[0_-2px_12px_rgba(180,83,9,0.18)]" },
];
const podiumRing = [
  "ring-2 ring-yellow-400/70 shadow-[0_0_22px_rgba(234,179,8,0.45)]",
  "ring-2 ring-gray-400/55 shadow-[0_0_14px_rgba(156,163,175,0.25)]",
  "ring-2 ring-amber-600/55 shadow-[0_0_14px_rgba(180,83,9,0.25)]",
];
const podiumValueColor = ["text-yellow-300", "text-gray-300", "text-amber-500"];

export default function LeaderboardTable({ rows, columns, accentColor, accentColorLight, rankLabel, primaryKey }: Props) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return (
      <div className="text-center py-20 text-gray-600 border border-white/5 rounded-2xl bg-white/[0.02]">
        <div className="text-4xl mb-3">📭</div>
        <p className="font-semibold">No data yet.</p>
        <p className="text-sm mt-1">Add some matches to see the leaderboard.</p>
      </div>
    );
  }

  const top3 = rows.slice(0, 3);
  const rest = rows.slice(3);
  const primaryCol = columns.find((c) => c.key === primaryKey);

  return (
    <div className="space-y-4">
      {/* ── Podium top 3 ── */}
      <div className="relative pt-4 pb-0">
        {/* Stage floor glow */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-8 rounded-full blur-2xl opacity-40 pointer-events-none"
          style={{ background: `radial-gradient(ellipse, ${accentColor} 0%, transparent 70%)` }} />

        <div className="relative flex items-end justify-center gap-2 sm:gap-3">
          {podiumOrder.map((rankIdx) => {
            const row = top3[rankIdx];
            if (!row) return <div key={rankIdx} className="flex-1" />;
            const plat = podiumPlatform[rankIdx];
            return (
              <div key={String(row.id)} className="flex-1 flex flex-col items-center">
                {/* Player card — floats above the platform */}
                <div className={`w-full rounded-t-2xl border ${podiumCardBg[rankIdx]} px-2 py-3 sm:px-3 sm:py-4 flex flex-col items-center gap-1.5 relative overflow-hidden`}>
                  {rankIdx === 0 && (
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full bg-yellow-400/10 blur-xl pointer-events-none" />
                  )}
                  <span className="text-xl sm:text-2xl relative z-10">{medals[rankIdx]}</span>
                  <div className={`relative z-10 w-10 h-10 sm:w-14 sm:h-14 rounded-full flex items-center justify-center font-black text-base sm:text-xl text-white ${podiumRing[rankIdx]}`}
                    style={{ background: `linear-gradient(135deg, ${accentColor}cc, ${accentColorLight})` }}>
                    {String(row.name)[0].toUpperCase()}
                  </div>
                  <div className="relative z-10 text-center">
                    <p className="font-black text-white text-xs sm:text-sm leading-tight truncate max-w-[72px] sm:max-w-none"
                      style={{ fontFamily: "var(--font-rajdhani)" }}>
                      {String(row.name)}
                    </p>
                    {primaryCol && (
                      <p className={`font-black ${podiumValueColor[rankIdx]}`}
                        style={{ fontFamily: "var(--font-bebas)", letterSpacing: "0.05em", fontSize: rankIdx === 0 ? "1.4rem" : "1.15rem" }}>
                        {fmt(row[primaryKey] as number | null, primaryCol.format)}
                        <span className="text-[9px] text-gray-500 font-normal ml-0.5">{primaryCol.label}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Platform block */}
                <div className={`w-full ${plat.height} ${plat.bg} ${plat.border} ${plat.glow} flex items-center justify-center`}>
                  <span className={`text-[9px] sm:text-[10px] font-black tracking-[0.2em] ${plat.labelColor}`}
                    style={{ fontFamily: "var(--font-oswald)" }}>
                    {plat.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Rest of the table ── */}
      {(rest.length > 0 || top3.length > 0) && (
        <div className="rounded-2xl border border-white/8 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}99 100%)` }}>
                <th className="px-4 py-3 text-left font-bold text-white/80 text-xs uppercase tracking-wider w-10">#</th>
                <th className="px-4 py-3 text-left font-bold text-white text-xs uppercase tracking-wider">{rankLabel}</th>
                {columns.map((c) => (
                  <th key={c.key} className="px-4 py-3 text-center font-bold text-white text-xs uppercase tracking-wider whitespace-nowrap">
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Show top 3 in table too, styled */}
              {rows.map((row, i) => (
                <tr key={String(row.id)}
                  className={`border-t border-white/5 transition-colors hover:bg-white/[0.05] ${i === 0 ? "bg-yellow-500/[0.04]" : i === 1 ? "bg-gray-400/[0.03]" : i === 2 ? "bg-amber-700/[0.04]" : "bg-transparent"}`}>
                  <td className="px-4 py-3 text-center">
                    {i < 3 ? <span className="text-base">{medals[i]}</span> : <span className="text-gray-600 text-xs font-bold">{i + 1}</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0"
                        style={{ background: accentColor + "66" }}>
                        {String(row.name)[0].toUpperCase()}
                      </div>
                      <span className={`font-semibold ${i === 0 ? "text-yellow-200" : "text-white"}`}>{String(row.name)}</span>
                    </div>
                  </td>
                  {columns.map((c) => (
                    <td key={c.key} className={`px-4 py-3 text-center ${c.key === primaryKey ? "font-bold text-white" : "text-gray-400"}`}>
                      {fmt(row[c.key] as number | null, c.format)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
