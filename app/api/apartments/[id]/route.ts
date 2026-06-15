import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import { prisma } from "@/lib/db";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const aptId = parseInt(id, 10);
  if (isNaN(aptId)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const jar = await cookies();
  const token = jar.get("mpl-token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let payload;
  try { payload = await verifyToken(token); }
  catch { return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); }

  // Verify against DB — token may be stale (missing apartmentId from old sessions)
  const caller = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!caller || caller.role !== "superadmin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Cannot delete MPL itself
  if (aptId === 1) {
    return NextResponse.json({ error: "Cannot delete the root league" }, { status: 400 });
  }

  const apt = await prisma.apartment.findUnique({ where: { id: aptId } });
  if (!apt) return NextResponse.json({ error: "League not found" }, { status: 404 });

  // Cascade: delete users, players, matches (stats cascade via Prisma schema)
  await prisma.user.deleteMany({ where: { apartmentId: aptId } });
  await prisma.match.deleteMany({ where: { apartmentId: aptId } });
  await prisma.player.deleteMany({ where: { apartmentId: aptId } });
  await prisma.apartment.delete({ where: { id: aptId } });

  return NextResponse.json({ ok: true });
}
