"use client";
import { useRouter, useSearchParams } from "next/navigation";

export default function SeasonFilter({ basePath, seasons }: { basePath: string; seasons: string[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const current = params.get("season") ?? "";

  if (seasons.length === 0) return null;

  function go(value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set("season", value); else next.delete("season");
    router.push(next.size ? `${basePath}?${next.toString()}` : basePath);
  }

  return (
    <div className="flex gap-1.5 flex-wrap items-center">
      <span className="text-[10px] uppercase tracking-widest text-gray-600 font-bold">Season</span>
      <button onClick={() => go("")}
        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
          current === "" ? "bg-white/20 text-white border-white/30" : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white"
        }`}>
        All
      </button>
      {seasons.map((s) => (
        <button key={s} onClick={() => go(s)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
            current === s ? "bg-indigo-500/30 text-indigo-200 border-indigo-500/40" : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white"
          }`}>
          {s}
        </button>
      ))}
    </div>
  );
}
