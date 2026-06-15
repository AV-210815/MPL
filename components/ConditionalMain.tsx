"use client";
import { usePathname } from "next/navigation";

const RESERVED = new Set([
  "api", "login", "signup", "stats", "bowling", "mvp", "explosive",
  "profiles", "matches", "players", "admin", "unauthorized", "apartments",
  "_next", "favicon.ico",
]);

function isSlugRoute(pathname: string) {
  const seg = pathname.split("/")[1] ?? "";
  return seg.length > 0 && !RESERVED.has(seg);
}

export default function ConditionalMain({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/login" || pathname === "/signup") return <>{children}</>;
  if (isSlugRoute(pathname)) return <>{children}</>;
  return (
    <main className="flex-1 container mx-auto px-4 py-6 max-w-6xl">{children}</main>
  );
}
