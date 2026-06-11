import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/jwt";

async function requireAdmin(req: NextRequest) {
  const token = req.cookies.get("mpl-token")?.value;
  if (!token) return null;
  try {
    const payload = await verifyToken(token);
    return payload.role === "admin" ? payload : null;
  } catch { return null; }
}

export async function GET(req: NextRequest) {
  if (!await requireAdmin(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" }, select: { id: true, username: true, role: true, status: true, permissions: true, createdAt: true } });
  return NextResponse.json(users);
}
