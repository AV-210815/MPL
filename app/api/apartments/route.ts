import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const RESERVED = new Set([
  "api", "login", "signup", "stats", "bowling", "mvp", "explosive",
  "profiles", "matches", "players", "admin", "unauthorized", "apartments",
  "_next", "favicon", "public",
]);

export async function GET() {
  const apartments = await prisma.apartment.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, slug: true, description: true, createdAt: true },
  });
  return NextResponse.json(apartments);
}

export async function POST(req: NextRequest) {
  try {
    const { name, slug, description } = await req.json();

    if (!name?.trim()) return NextResponse.json({ error: "League name is required" }, { status: 400 });
    if (!slug?.trim()) return NextResponse.json({ error: "URL slug is required" }, { status: 400 });

    const cleanSlug = slug.trim().toLowerCase();
    if (!/^[a-z0-9-]+$/.test(cleanSlug))
      return NextResponse.json({ error: "Slug can only contain lowercase letters, numbers, and hyphens" }, { status: 400 });
    if (cleanSlug.length < 2)
      return NextResponse.json({ error: "Slug must be at least 2 characters" }, { status: 400 });
    if (cleanSlug.length > 30)
      return NextResponse.json({ error: "Slug must be 30 characters or less" }, { status: 400 });
    if (RESERVED.has(cleanSlug))
      return NextResponse.json({ error: "That slug is reserved — choose a different one" }, { status: 400 });

    const existing = await prisma.apartment.findUnique({ where: { slug: cleanSlug } });
    if (existing) return NextResponse.json({ error: "That slug is already taken" }, { status: 409 });

    const apartment = await prisma.apartment.create({
      data: { name: name.trim(), slug: cleanSlug, description: description?.trim() || null },
    });

    return NextResponse.json(apartment, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
