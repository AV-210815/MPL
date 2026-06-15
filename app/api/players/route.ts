import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/jwt";

async function getApartmentId(req: NextRequest): Promise<number> {
  try {
    const token = req.cookies.get("mpl-token")?.value;
    if (!token) return 1;
    const payload = await verifyToken(token);
    return payload.apartmentId ?? 1;
  } catch { return 1; }
}

export async function GET(req: NextRequest) {
  const apartmentId = await getApartmentId(req);
  const players = await prisma.player.findMany({ where: { apartmentId }, orderBy: { name: "asc" } });
  return NextResponse.json(players);
}

export async function POST(req: NextRequest) {
  const apartmentId = await getApartmentId(req);
  const { name } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "Name required" }, { status: 400 });
  try {
    const player = await prisma.player.create({ data: { apartmentId, name: name.trim() } });
    return NextResponse.json(player, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Player already exists" }, { status: 409 });
  }
}
