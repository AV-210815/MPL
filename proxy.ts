import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import type { TokenPayload } from "@/lib/jwt";

const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? "mpl-super-secret-jwt-key-change-in-prod-2026");

// No auth required at all
const PUBLIC = [
  "/", "/login", "/signup", "/unauthorized",
  "/api/auth/login", "/api/auth/signup",
  "/stats", "/bowling", "/mvp", "/explosive", "/profiles",
  "/api/mvp", "/api/leaderboard", "/api/profiles",
];

// Auth required but no permission check (accessible to all logged-in users)
const ALWAYS_ALLOWED = ["/api/auth/me", "/api/auth/logout"];

function hasPermission(permissions: string[], pathname: string): boolean {
  if (permissions.includes("*")) return true;
  return permissions.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
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

  // Admins can access everything
  if (payload.role === "admin") return NextResponse.next();

  // Non-admin API routes: any authenticated user may call them.
  // Admin-only APIs protect themselves inside the route handler.
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
