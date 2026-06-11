import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import type { BowlingStat } from "@/app/generated/prisma/client";

export async function GET(req: NextRequest) {
  const format = req.nextUrl.searchParams.get("format") || undefined;
  const players = await prisma.player.findMany({
    include: { bowling: { where: format ? { match: { format } } : undefined } },
  });

  const leaderboard = players
    .map((p) => {
      const wickets = p.bowling.reduce((s: number, b: BowlingStat) => s + b.wickets, 0);
      const maidens = p.bowling.reduce((s: number, b: BowlingStat) => s + b.maidens, 0);
      const runsConceded = p.bowling.reduce((s: number, b: BowlingStat) => s + b.runsConceded, 0);
      const overs = p.bowling.reduce((s: number, b: BowlingStat) => s + b.overs, 0);
      const economy = overs > 0 ? runsConceded / overs : 0;
      const avg = wickets > 0 ? runsConceded / wickets : 0;
      const matches = new Set(p.bowling.map((b: BowlingStat) => b.matchId)).size;
      const innings = p.bowling.length;
      return { id: p.id, name: p.name, matches, innings, wickets, overs, runsConceded, maidens, economy, avg };
    })
    .filter((p) => p.innings > 0)
    .sort((a, b) => b.wickets - a.wickets || a.economy - b.economy);

  return NextResponse.json(leaderboard);
}
