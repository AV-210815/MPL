import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const players = await prisma.player.findMany({
      orderBy: { name: "asc" },
      include: {
        batting: { where: { dnb: false } },
        bowling: true,
      },
    });

    const profiles = players.map((p) => {
      const innings = p.batting.filter((b) => !b.dnb);
      const runs = innings.reduce((s, b) => s + b.runs, 0);
      const hundreds = innings.filter((b) => b.runs >= 100).length;
      const fifties = innings.filter((b) => b.runs >= 50 && b.runs < 100).length;
      const dismissals = innings.filter((b) => !b.notOut).length;
      const avg = dismissals > 0 ? runs / dismissals : runs > 0 ? null : 0;
      const balls = innings.reduce((s, b) => s + b.balls, 0);
      const sr = balls > 0 ? (runs / balls) * 100 : 0;
      const fours = innings.reduce((s, b) => s + b.fours, 0);
      const sixes = innings.reduce((s, b) => s + b.sixes, 0);

      const wickets = p.bowling.reduce((s, b) => s + b.wickets, 0);
      const maidens = p.bowling.reduce((s, b) => s + b.maidens, 0);
      const runsConceded = p.bowling.reduce((s, b) => s + b.runsConceded, 0);
      const overs = p.bowling.reduce((s, b) => s + b.overs, 0);
      const economy = overs > 0 ? runsConceded / overs : 0;
      const bowlingAvg = wickets > 0 ? runsConceded / wickets : null;

      const matchIds = new Set([
        ...p.batting.map((b) => b.matchId),
        ...p.bowling.map((b) => b.matchId),
      ]);

      return {
        id: p.id,
        name: p.name,
        photo: p.photo ?? null,
        matches: matchIds.size,
        batting: { innings: innings.length, runs, avg, sr, hundreds, fifties, fours, sixes },
        bowling: { wickets, maidens, overs, runsConceded, economy, avg: bowlingAvg },
      };
    });

    return NextResponse.json(profiles);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
