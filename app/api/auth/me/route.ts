import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("mpl-token")?.value;
  if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  try {
    const payload = await verifyToken(token);
    return NextResponse.json({ userId: payload.userId, username: payload.username, role: payload.role, permissions: payload.permissions ?? [] });
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}
