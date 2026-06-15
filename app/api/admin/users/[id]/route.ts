import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/jwt";
import bcrypt from "bcryptjs";

async function requireAdmin(req: NextRequest) {
  const token = req.cookies.get("mpl-token")?.value;
  if (!token) return null;
  try {
    const payload = await verifyToken(token);
    return (payload.role === "admin" || payload.role === "superadmin") ? payload : null;
  } catch { return null; }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const userId = Number(id);
  if (userId === admin.userId) return NextResponse.json({ error: "Cannot modify your own account" }, { status: 400 });

  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target || target.apartmentId !== admin.apartmentId) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const { status, role, permissions, newPassword } = await req.json();
  const data: Record<string, string> = {};
  if (status !== undefined) data.status = status;
  if (role !== undefined) data.role = role;
  if (permissions !== undefined) data.permissions = JSON.stringify(permissions);
  if (newPassword !== undefined) {
    if (newPassword.length < 6) return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    data.password = await bcrypt.hash(newPassword, 12);
  }

  const user = await prisma.user.update({ where: { id: userId }, data, select: { id: true, username: true, role: true, status: true, permissions: true } });
  return NextResponse.json(user);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const userId = Number(id);
  if (userId === admin.userId) return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 });

  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target || target.apartmentId !== admin.apartmentId) return NextResponse.json({ error: "User not found" }, { status: 404 });

  await prisma.user.delete({ where: { id: userId } });
  return NextResponse.json({ ok: true });
}
