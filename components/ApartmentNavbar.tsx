"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const PUBLIC_LINKS = [
  { href: "/stats",     label: "🟠 Orange Cap" },
  { href: "/bowling",   label: "🟣 Purple Cap" },
  { href: "/mvp",       label: "🏆 MVP" },
  { href: "/explosive", label: "💥 Explosive" },
  { href: "/profiles",  label: "📊 Profiles" },
];
const AUTH_LINKS = [
  { href: "/matches", label: "📋 Matches" },
  { href: "/players", label: "👤 Players" },
];

export default function ApartmentNavbar({ slug, name }: { slug: string; name: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const base = `/${slug}`;

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        if (d?.slug === slug) {
          setIsLoggedIn(true);
          setUsername(d.username ?? null);
          setRole(d.role ?? null);
        } else {
          setIsLoggedIn(false);
          setUsername(null);
          setRole(null);
        }
      });
  }, [pathname, slug]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push(`${base}/login`);
    router.refresh();
  }

  if (pathname === `${base}/login` || pathname === `${base}/signup`) return null;

  return (
    <nav className="bg-[#0a0a18] border-b border-white/10 sticky top-0 z-50">
      <div className="container mx-auto px-4 max-w-6xl flex items-center gap-4 h-14">
        <Link href={base}
          className="text-xl tracking-widest text-white shrink-0 hover:text-orange-400 transition-colors uppercase flex items-center gap-2"
          style={{ fontFamily: "var(--font-bebas)" }}>
          🏏 {name}
        </Link>
        <div className="flex gap-1 overflow-x-auto flex-1">
          {PUBLIC_LINKS.map((l) => (
            <Link key={l.href} href={`${base}${l.href}`}
              className={`px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                pathname === `${base}${l.href}` || (l.href === "/stats" && pathname === base)
                  ? "bg-white/15 text-white"
                  : "text-gray-400 hover:text-white hover:bg-white/10"
              }`}>
              {l.label}
            </Link>
          ))}
          {isLoggedIn && AUTH_LINKS.map((l) => (
            <Link key={l.href} href={`${base}${l.href}`}
              className={`px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                pathname === `${base}${l.href}` ? "bg-white/15 text-white" : "text-gray-400 hover:text-white hover:bg-white/10"
              }`}>
              {l.label}
            </Link>
          ))}
          {isLoggedIn && (role === "admin" || role === "superadmin") && (
            <Link href={`${base}/admin`}
              className={`px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                pathname === `${base}/admin` ? "bg-orange-500/25 text-orange-300" : "text-orange-500/70 hover:text-orange-400 hover:bg-orange-500/10"
              }`}>
              ⚙️ Admin
            </Link>
          )}
          <Link href="/apartments"
            className="px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors text-gray-600 hover:text-gray-400 hover:bg-white/5">
            ← All Leagues
          </Link>
        </div>
        {isLoggedIn && username ? (
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
          <Link href={`${base}/login`}
            className="shrink-0 px-3 py-1.5 rounded-lg bg-orange-500/15 hover:bg-orange-500/25 border border-orange-500/25 text-xs text-orange-400 hover:text-orange-300 font-semibold transition-all">
            Sign in
          </Link>
        )}
      </div>
    </nav>
  );
}
