"use client";
import { useRouter, useSearchParams } from "next/navigation";

const FORMATS = [
  { value: "", label: "All Formats" },
  { value: "T20", label: "T20" },
  { value: "ODI", label: "ODI" },
  { value: "TEST", label: "Test" },
];

export default function FormatFilter({ basePath }: { basePath: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const current = params.get("format") ?? "";

  function go(value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set("format", value); else next.delete("format");
    router.push(next.size ? `${basePath}?${next.toString()}` : basePath);
  }

  return (
    <div className="flex gap-1.5 flex-wrap">
      {FORMATS.map((f) => (
        <button key={f.value} onClick={() => go(f.value)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
            current === f.value
              ? "bg-white/20 text-white border-white/30"
              : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white"
          }`}>
          {f.label}
        </button>
      ))}
    </div>
  );
}
