import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="relative -mt-6 -mx-4 px-4 pt-0 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full bg-red-600/10 blur-[120px]" />
      </div>
      <div className="relative flex flex-col sm:flex-row sm:items-center gap-4 pt-10 pb-8">
        <div className="flex-1">
          <p className="text-xs uppercase tracking-[0.25em] text-red-400 font-bold mb-1">Restricted</p>
          <h1 className="text-[5rem] sm:text-[7rem] leading-none bg-gradient-to-br from-red-300 via-red-400 to-rose-500 bg-clip-text text-transparent"
            style={{ fontFamily: "var(--font-bebas)", letterSpacing: "0.05em", lineHeight: 1 }}>
            Access<br /><span className="text-white">Denied</span>
          </h1>
          <p className="text-gray-500 mt-2 text-sm max-w-sm" style={{ fontFamily: "var(--font-rajdhani)", fontWeight: 600 }}>
            You don&apos;t have permission to view this page. Contact an admin to get access.
          </p>
          <Link href="/" className="mt-6 inline-block px-6 py-2.5 bg-orange-500 hover:bg-orange-400 text-white font-bold text-sm rounded-xl transition-all shadow-[0_0_20px_rgba(249,115,22,0.3)]">
            Back to Home
          </Link>
        </div>
        <div className="text-[7rem] sm:text-[9rem] leading-none select-none shrink-0 self-center opacity-35">
          🚫
        </div>
      </div>
      <div className="h-px bg-gradient-to-r from-red-500/50 via-red-500/20 to-transparent" />
    </div>
  );
}
