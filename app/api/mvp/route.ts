import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

async function getApartmentId(req: NextRequest): Promise<number> {
  const slug = req.nextUrl.searchParams.get("slug");
  if (slug) {
    const apt = await prisma.apartment.findUnique({ where: { slug } });
    if (apt) return apt.id;
  }
  return 1;
}

export async function GET(req: NextRequest) {
  try {
    const apartmentId = await getApartmentId(req);
    const matches = await prisma.match.findMany({
      where: { apartmentId },
      orderBy: { date: "asc" },
      include: {
        batting: { include: { player: true }, where: { dnb: false } },
        bowling: { include: { player: true } },
      },
    });

    const byMonth: Record<string, typeof matches> = {};
    for (const m of matches) {
      const key = m.date.toISOString().slice(0, 7);
      if (!byMonth[key]) byMonth[key] = [];
      byMonth[key].push(m);
    }

    const months = Object.entries(byMonth)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([monthKey, monthMatches]) => {
        const batMap: Record<number, { name: string; runs: number; innings: number }> = {};
        for (const m of monthMatches) {
          for (const b of m.batting) {
            if (!batMap[b.playerId]) batMap[b.playerId] = { name: b.player.name, runs: 0, innings: 0 };
            batMap[b.playerId].runs += b.runs;
            batMap[b.playerId].innings += 1;
          }
        }
        const topBatter = Object.values(batMap).sort((a, b) => b.runs - a.runs)[0] ?? null;

        const bowlMap: Record<number, { name: string; wickets: number; innings: number }> = {};
        for (const m of monthMatches) {
          for (const b of m.bowling) {
            if (!bowlMap[b.playerId]) bowlMap[b.playerId] = { name: b.player.name, wickets: 0, innings: 0 };
            bowlMap[b.playerId].wickets += b.wickets;
            bowlMap[b.playerId].innings += 1;
          }
        }
        const topBowler = Object.values(bowlMap).sort((a, b) => b.wickets - a.wickets)[0] ?? null;

        const label = new Date(`${monthKey}-01`).toLocaleDateString("en-IN", { month: "long", year: "numeric" });
        return { month: label, matches: monthMatches.length, topBatter, topBowler };
      });

    return NextResponse.json(months);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
