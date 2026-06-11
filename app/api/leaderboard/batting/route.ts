import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import type { BattingStat } from "@/app/generated/prisma/client";

export async function GET(req: NextRequest) {
  const format = req.nextUrl.searchParams.get("format") || undefined;
  const players = await prisma.player.findMany({
    include: { batting: { where: format ? { match: { format } } : undefined } },
  });

  const leaderboard = players
    .map((p) => {
      const innings = p.batting.length;
      const runs = p.batting.reduce((s: number, b: BattingStat) => s + b.runs, 0);
      const balls = p.batting.reduce((s: number, b: BattingStat) => s + b.balls, 0);
      const fours = p.batting.reduce((s: number, b: BattingStat) => s + b.fours, 0);
      const sixes = p.batting.reduce((s: number, b: BattingStat) => s + b.sixes, 0);
      const dismissals = p.batting.filter((b: BattingStat) => !b.notOut).length;
      const avg = dismissals > 0 ? runs / dismissals : runs > 0 ? null : 0;
      const sr = balls > 0 ? (runs / balls) * 100 : 0;
      const matches = new Set(p.batting.map((b: BattingStat) => b.matchId)).size;
      return { id: p.id, name: p.name, matches, innings, runs, balls, fours, sixes, dismissals, avg, sr };
    })
    .filter((p) => p.innings > 0)
    .sort((a, b) => b.runs - a.runs);

  return NextResponse.json(leaderboard);
}
