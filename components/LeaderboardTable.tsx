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
const podiumRings = [
  "ring-2 ring-yellow-400/60 shadow-[0_0_20px_rgba(234,179,8,0.3)]",
  "ring-2 ring-gray-400/60 shadow-[0_0_16px_rgba(156,163,175,0.2)]",
  "ring-2 ring-amber-700/60 shadow-[0_0_16px_rgba(180,83,9,0.2)]",
];
const podiumBg = [
  "bg-gradient-to-b from-yellow-500/10 to-transparent border-yellow-500/20",
  "bg-gradient-to-b from-gray-400/8 to-transparent border-gray-400/15",
  "bg-gradient-to-b from-amber-700/10 to-transparent border-amber-700/20",
];
const podiumValueColor = [
  "text-yellow-300",
  "text-gray-300",
  "text-amber-500",
];

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
      <div className="grid grid-cols-3 gap-3">
        {top3.map((row, i) => (
          <div key={String(row.id)}
            className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl border ${podiumBg[i]} text-center overflow-hidden`}>
            {/* Glow blob */}
            <div className="absolute inset-0 opacity-20 blur-2xl rounded-full"
              style={{ background: i === 0 ? "radial-gradient(circle, #eab308 0%, transparent 70%)" : i === 1 ? "radial-gradient(circle, #9ca3af 0%, transparent 70%)" : "radial-gradient(circle, #b45309 0%, transparent 70%)" }} />
            <span className="text-2xl relative z-10">{medals[i]}</span>
            {/* Avatar */}
            <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center font-black text-lg text-white ${podiumRings[i]}`}
              style={{ background: accentColorLight }}>
              {String(row.name)[0].toUpperCase()}
            </div>
            <div className="relative z-10">
              <p className="font-black text-white text-sm leading-tight" style={{ fontFamily: "var(--font-rajdhani)" }}>
                {String(row.name)}
              </p>
              {primaryCol && (
                <p className={`text-xl font-black mt-0.5 ${podiumValueColor[i]}`} style={{ fontFamily: "var(--font-bebas)", letterSpacing: "0.05em" }}>
                  {fmt(row[primaryKey] as number | null, primaryCol.format)}
                  <span className="text-xs text-gray-500 font-normal ml-1">{primaryCol.label}</span>
                </p>
              )}
            </div>
          </div>
        ))}
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
