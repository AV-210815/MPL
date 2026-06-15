import { getMilestones } from "@/lib/queries";

export default async function MilestonesPage() {
  const { batting, bowling } = await getMilestones(1);

  return (
    <div className="relative -mt-6 -mx-4 px-4 pt-0 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-green-600/10 blur-[140px]" />
        <div className="absolute top-60 -left-20 w-[320px] h-[320px] rounded-full bg-teal-600/8 blur-[100px]" />
      </div>

      <div className="relative pt-8 pb-5">
        <p className="text-[10px] uppercase tracking-[0.3em] text-green-400/80 font-bold mb-1.5">Coming Up</p>
        <h1 style={{ fontFamily: "var(--font-bebas)", letterSpacing: "0.04em", lineHeight: 1 }}
          className="text-[2.8rem] sm:text-[3.5rem] leading-none">
          <span className="bg-gradient-to-br from-green-300 to-teal-400 bg-clip-text text-transparent">Mile</span>
          <span className="text-white">stones</span>
        </h1>
        <p className="text-xs text-gray-600 mt-2">Who's closest to the next landmark?</p>
      </div>

      <div className="relative space-y-8 pb-10">
        {/* Batting milestones */}
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-orange-400 font-bold mb-3">🏏 Run Milestones</p>
          {batting.length === 0 ? (
            <p className="text-sm text-gray-600 py-4">No batting data yet.</p>
          ) : (
            <div className="space-y-3">
              {batting.map((p) => {
                const pct = p.nextMilestone ? Math.min(99, Math.round((p.current / p.nextMilestone) * 100)) : 100;
                return (
                  <div key={p.id} className="px-4 py-3.5 rounded-xl bg-orange-500/[0.05] border border-orange-500/12">
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <p className="text-white font-bold truncate" style={{ fontFamily: "var(--font-rajdhani)", fontSize: "1.05rem" }}>{p.name}</p>
                        <span className="text-sm font-black text-orange-300 shrink-0" style={{ fontFamily: "var(--font-oswald)" }}>{p.current}</span>
                        <span className="text-gray-600 text-xs shrink-0">runs</span>
                      </div>
                      <div className="text-right shrink-0 ml-3">
                        <span className="text-[10px] text-gray-600">{p.gap} away · </span>
                        <span className="text-sm font-black text-orange-300" style={{ fontFamily: "var(--font-oswald)" }}>{p.nextMilestone}</span>
                      </div>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/8 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-orange-500 to-yellow-400 transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Bowling milestones */}
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-purple-400 font-bold mb-3">🎯 Wicket Milestones</p>
          {bowling.length === 0 ? (
            <p className="text-sm text-gray-600 py-4">No bowling data yet.</p>
          ) : (
            <div className="space-y-3">
              {bowling.map((p) => {
                const pct = p.nextMilestone ? Math.min(99, Math.round((p.current / p.nextMilestone) * 100)) : 100;
                return (
                  <div key={p.id} className="px-4 py-3.5 rounded-xl bg-purple-500/[0.05] border border-purple-500/12">
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <p className="text-white font-bold truncate" style={{ fontFamily: "var(--font-rajdhani)", fontSize: "1.05rem" }}>{p.name}</p>
                        <span className="text-sm font-black text-purple-300 shrink-0" style={{ fontFamily: "var(--font-oswald)" }}>{p.current}</span>
                        <span className="text-gray-600 text-xs shrink-0">wickets</span>
                      </div>
                      <div className="text-right shrink-0 ml-3">
                        <span className="text-[10px] text-gray-600">{p.gap} away · </span>
                        <span className="text-sm font-black text-purple-300" style={{ fontFamily: "var(--font-oswald)" }}>{p.nextMilestone}</span>
                      </div>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/8 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-violet-400 transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
