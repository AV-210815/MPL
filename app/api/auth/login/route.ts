import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { signToken } from "@/lib/jwt";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();
    if (!username || !password) return NextResponse.json({ error: "Username and password required" }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { username: username.trim() } });
    if (!user) return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });

    if (user.status === "pending") return NextResponse.json({ error: "Your account is pending admin approval." }, { status: 403 });
    if (user.status === "rejected") return NextResponse.json({ error: "Your account has been rejected." }, { status: 403 });

    const permissions: string[] = JSON.parse(user.permissions || "[]");
    const token = await signToken({ userId: user.id, username: user.username, role: user.role, status: user.status, permissions });

    const proto = req.headers.get("x-forwarded-proto") ?? "";
    const isHttps = proto === "https" || process.env.NODE_ENV === "production";
    const res = NextResponse.json({ ok: true, username: user.username, role: user.role });
    res.cookies.set("mpl-token", token, {
      httpOnly: true,
      secure: isHttps,
      sameSite: isHttps ? "none" : "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    return res;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
