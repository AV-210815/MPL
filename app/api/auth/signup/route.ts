import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

const DEFAULT_PERMISSIONS = ["/stats", "/bowling", "/mvp", "/explosive", "/profiles"];

export async function POST(req: NextRequest) {
  try {
    const { username, password, slug } = await req.json();

    if (!username?.trim()) return NextResponse.json({ error: "Username is required" }, { status: 400 });
    if (!password || password.length < 6) return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    if (username.trim().length < 3) return NextResponse.json({ error: "Username must be at least 3 characters" }, { status: 400 });
    if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) return NextResponse.json({ error: "Username can only contain letters, numbers, and underscores" }, { status: 400 });

    const aptSlug = slug ?? "mpl";
    const apartment = await prisma.apartment.findUnique({ where: { slug: aptSlug } });
    if (!apartment) return NextResponse.json({ error: "League not found" }, { status: 404 });

    const existing = await prisma.user.findUnique({ where: { apartmentId_username: { apartmentId: apartment.id, username: username.trim() } } });
    if (existing) return NextResponse.json({ error: "Username is already taken" }, { status: 409 });

    const userCount = await prisma.user.count({ where: { apartmentId: apartment.id } });
    const isFirst = userCount === 0;

    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        apartmentId: apartment.id,
        username: username.trim(),
        password: hashed,
        role: isFirst ? "admin" : "user",
        status: isFirst ? "approved" : "pending",
        permissions: isFirst ? JSON.stringify(["*"]) : JSON.stringify(DEFAULT_PERMISSIONS),
      },
    });

    return NextResponse.json({ id: user.id, username: user.username, status: user.status }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
