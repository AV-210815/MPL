import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import type { TokenPayload } from "@/lib/jwt";

const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? "mpl-super-secret-jwt-key-change-in-prod-2026");

// No auth required at all
const PUBLIC = [
  "/", "/login", "/signup", "/unauthorized",
  "/api/auth/login", "/api/auth/signup",
  "/stats", "/bowling", "/mvp", "/explosive", "/profiles", "/compare",
  "/rivals", "/milestones", "/standings", "/share",
  "/api/mvp", "/api/leaderboard", "/api/profiles",
  "/api/apartments",
  "/apartments",
];

// Auth required but no permission check (accessible to all logged-in users)
const ALWAYS_ALLOWED = ["/api/auth/me", "/api/auth/logout"];

// Segments that are top-level MPL pages — anything else is treated as a [slug] route
const RESERVED_SEGMENTS = new Set([
  "api", "login", "signup", "stats", "bowling", "mvp", "explosive",
  "profiles", "matches", "players", "admin", "superadmin", "compare", "unauthorized", "apartments",
  "rivals", "milestones", "standings", "share",
  "_next", "favicon.ico",
]);

// Slug sub-paths that are publicly accessible (no auth required)
const SLUG_PUBLIC_SUFFIXES = [
  "/stats", "/bowling", "/mvp", "/explosive", "/profiles",
  "/login", "/signup", "/unauthorized",
];

function isSlugRoute(pathname: string): boolean {
  const seg = pathname.split("/")[1] ?? "";
  return seg.length > 0 && !RESERVED_SEGMENTS.has(seg);
}

function isSlugPublic(pathname: string): boolean {
  const parts = pathname.split("/");
  const suffix = "/" + parts.slice(2).join("/");
  return suffix === "/" || suffix === "" || SLUG_PUBLIC_SUFFIXES.some((p) => suffix === p || suffix.startsWith(p + "/"));
}

function hasPermission(permissions: string[], pathname: string): boolean {
  if (permissions.includes("*")) return true;
  return permissions.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Slug routes: public sub-paths need no auth; protected sub-paths need JWT scoped to that slug
  if (isSlugRoute(pathname)) {
    if (isSlugPublic(pathname)) return NextResponse.next();
    // Protected slug page: require any valid token (the page itself checks slug match)
    const token = req.cookies.get("mpl-token")?.value;
    if (!token) return NextResponse.redirect(new URL(`/${pathname.split("/")[1]}/login`, req.url));
    try { await jwtVerify(token, secret); return NextResponse.next(); }
    catch { return NextResponse.redirect(new URL(`/${pathname.split("/")[1]}/login`, req.url)); }
  }

  if (PUBLIC.some((p) => pathname.startsWith(p))) return NextResponse.next();
  if (ALWAYS_ALLOWED.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    const token = req.cookies.get("mpl-token")?.value;
    const isApi = pathname.startsWith("/api/");
    if (!token) {
      if (isApi) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
      return NextResponse.redirect(new URL("/login", req.url));
    }
    try { await jwtVerify(token, secret); return NextResponse.next(); }
    catch {
      if (isApi) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  const isApi = pathname.startsWith("/api/");
  const token = req.cookies.get("mpl-token")?.value;

  if (!token) {
    if (isApi) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.redirect(new URL("/login", req.url));
  }

  let payload: TokenPayload;
  try {
    const result = await jwtVerify(token, secret);
    payload = result.payload as unknown as TokenPayload;
  } catch {
    if (isApi) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const res = NextResponse.redirect(new URL("/login", req.url));
    res.cookies.set("mpl-token", "", { maxAge: 0, path: "/" });
    return res;
  }

  // Admins and superadmins can access everything
  if (payload.role === "admin" || payload.role === "superadmin") return NextResponse.next();

  // Non-admin API routes: any authenticated user may call them.
  if (isApi) return NextResponse.next();

  // Check page-level permissions for non-API routes
  if (!hasPermission(payload.permissions ?? [], pathname)) {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
