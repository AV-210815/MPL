import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import type { BattingStat } from "@/app/generated/prisma/client";

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
    const format = req.nextUrl.searchParams.get("format") || undefined;
    const players = await prisma.player.findMany({
      where: { apartmentId },
      include: { batting: { where: format ? { dnb: false, match: { format } } : { dnb: false } } },
    });

    const rows = players
      .map((p) => {
        const innings = p.batting.length;
        const fours = p.batting.reduce((s: number, b: BattingStat) => s + b.fours, 0);
        const sixes = p.batting.reduce((s: number, b: BattingStat) => s + b.sixes, 0);
        const boundaries = fours + sixes;
        const runs = p.batting.reduce((s: number, b: BattingStat) => s + b.runs, 0);
        const balls = p.batting.reduce((s: number, b: BattingStat) => s + b.balls, 0);
        const boundaryRuns = fours * 4 + sixes * 6;
        const boundaryPct = runs > 0 ? (boundaryRuns / runs) * 100 : 0;
        const matches = new Set(p.batting.map((b: BattingStat) => b.matchId)).size;
        return { id: p.id, name: p.name, matches, innings, fours, sixes, boundaries, runs, balls, boundaryRuns, boundaryPct };
      })
      .filter((p) => p.innings > 0)
      .sort((a, b) => b.boundaries - a.boundaries || b.sixes - a.sixes);

    return NextResponse.json(rows);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
