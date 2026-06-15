"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const RESERVED = new Set([
  "api", "login", "signup", "stats", "bowling", "mvp", "explosive",
  "profiles", "matches", "players", "admin", "superadmin", "compare", "unauthorized", "apartments",
  "rivals", "milestones", "standings", "share",
  "_next", "favicon.ico",
]);

function isSlugRoute(pathname: string) {
  const seg = pathname.split("/")[1] ?? "";
  return seg.length > 0 && !RESERVED.has(seg);
}

const PUBLIC_LINKS = ["/stats", "/bowling", "/mvp", "/explosive", "/profiles", "/compare", "/rivals", "/milestones", "/standings"];

const links = [
  { href: "/stats",       label: "🟠 Orange Cap",    color: "text-orange-400" },
  { href: "/bowling",     label: "🟣 Purple Cap",    color: "text-purple-400" },
  { href: "/mvp",         label: "🏆 MVP",           color: "text-yellow-400" },
  { href: "/explosive",   label: "💥 Explosive",     color: "text-red-400" },
  { href: "/rivals",      label: "⚔️ Rivals",        color: "text-red-400" },
  { href: "/milestones",  label: "🎖️ Milestones",   color: "text-green-400" },
  { href: "/standings",   label: "📊 Standings",     color: "text-cyan-400" },
  { href: "/matches",     label: "📋 Matches",       color: "" },
  { href: "/profiles",    label: "👤 Profiles",      color: "" },
  { href: "/players",     label: "👥 Players",       color: "" },
  { href: "/compare",     label: "🔀 Compare",       color: "" },
  { href: "/apartments",  label: "🏘️ Other Leagues", color: "" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        setUsername(d?.username ?? null);
        setRole(d?.role ?? null);
        setPermissions(d?.permissions ?? []);
      });
  }, [pathname]);

  function canSee(href: string) {
    if (href === "/apartments") return true;
    if (PUBLIC_LINKS.includes(href)) return true;
    if (!username) return false;
    if (role === "admin" || role === "superadmin") return true;
    if (permissions.includes("*")) return true;
    return permissions.some((p) => href === p || href.startsWith(p + "/"));
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  if (pathname === "/login" || pathname === "/signup") return null;
  if (isSlugRoute(pathname)) return null;

  return (
    <nav className="bg-[#0a0a18] border-b border-white/10 sticky top-0 z-50">
      <div className="container mx-auto px-4 max-w-6xl flex items-center gap-4 h-14">
        <Link href="/" className="text-2xl tracking-widest text-white shrink-0 hover:text-orange-400 transition-colors uppercase" style={{ fontFamily: "var(--font-bebas)" }}>
          🏏 MPL
        </Link>
        <div className="flex gap-1 overflow-x-auto flex-1">
          {links.filter((l) => canSee(l.href)).map((l) => (
            <Link key={l.href} href={l.href}
              className={`px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                pathname === l.href
                  ? `bg-white/15 ${l.color || "text-white"}`
                  : `${l.color || "text-gray-400"} hover:brightness-125 hover:bg-white/10`
              }`}>
              {l.label}
            </Link>
          ))}
          {(role === "admin" || role === "superadmin") && (
            <Link href="/admin"
              className={`px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                pathname === "/admin" ? "bg-orange-500/25 text-orange-300" : "text-orange-500/70 hover:text-orange-400 hover:bg-orange-500/10"
              }`}>
              ⚙️ Admin
            </Link>
          )}
          {role === "superadmin" && (
            <Link href="/superadmin"
              className={`px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                pathname === "/superadmin" ? "bg-yellow-500/25 text-yellow-300" : "text-yellow-500/70 hover:text-yellow-400 hover:bg-yellow-500/10"
              }`}>
              👑 Super
            </Link>
          )}
        </div>
        {username ? (
          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/8">
              <div className="w-5 h-5 rounded-full bg-orange-500/30 border border-orange-500/50 flex items-center justify-center text-[10px] font-black text-orange-300">
                {username[0].toUpperCase()}
              </div>
              <span className="text-xs text-gray-300 font-medium">{username}</span>
              {role === "superadmin" && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 font-bold uppercase">👑 SuperAdmin</span>}
              {role === "admin" && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400 font-bold uppercase">Admin</span>}
            </div>
            <button onClick={logout}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-red-500/15 border border-white/8 hover:border-red-500/30 text-xs text-gray-400 hover:text-red-400 transition-all font-medium">
              Sign out
            </button>
          </div>
        ) : (
          <Link href="/login"
            className="shrink-0 px-3 py-1.5 rounded-lg bg-orange-500/15 hover:bg-orange-500/25 border border-orange-500/25 text-xs text-orange-400 hover:text-orange-300 font-semibold transition-all">
            Sign in
          </Link>
        )}
      </div>
    </nav>
  );
}
