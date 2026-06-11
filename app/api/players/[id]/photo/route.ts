import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { prisma } from "@/lib/db";

// Photo uploads require a writable local filesystem.
// On Vercel, set up Vercel Blob storage to enable this in production.

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const playerId = Number(id);

  const formData = await req.formData();
  const file = formData.get("photo") as File | null;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const allowed = ["jpg", "jpeg", "png", "webp", "gif"];
  if (!allowed.includes(ext)) return NextResponse.json({ error: "Only images allowed" }, { status: 400 });
  if (buffer.length > 5 * 1024 * 1024) return NextResponse.json({ error: "Max 5 MB" }, { status: 400 });

  const filename = `player_${playerId}_${Date.now()}.${ext}`;
  const dir = join(process.cwd(), "public", "uploads", "players");
  try {
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, filename), buffer);
  } catch {
    return NextResponse.json({ error: "Photo upload requires local filesystem. Set up Vercel Blob for production." }, { status: 500 });
  }

  const photoUrl = `/uploads/players/${filename}`;
  await prisma.player.update({ where: { id: playerId }, data: { photo: photoUrl } });

  return NextResponse.json({ photo: photoUrl });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.player.update({ where: { id: Number(id) }, data: { photo: null } });
  return NextResponse.json({ ok: true });
}
