import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";
import { getBattingLeaderboardMulti, getBowlingLeaderboardMulti } from "@/lib/queries";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("mpl-token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const payload = await verifyToken(token);
    if (payload.role !== "superadmin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const ids = req.nextUrl.searchParams.get("apartments");
    const type = req.nextUrl.searchParams.get("type") ?? "batting";
    const format = req.nextUrl.searchParams.get("format") ?? undefined;

    const apartmentIds = ids
      ? ids.split(",").map(Number).filter((n) => !isNaN(n) && n > 0)
      : [];

    if (apartmentIds.length === 0) return NextResponse.json([]);

    const data = type === "bowling"
      ? await getBowlingLeaderboardMulti(apartmentIds, format)
      : await getBattingLeaderboardMulti(apartmentIds, format);

    return NextResponse.json(data);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
