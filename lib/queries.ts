import { prisma } from "@/lib/db";
import type { BattingStat, BowlingStat } from "@/app/generated/prisma/client";

export async function getBattingLeaderboard(format?: string) {
  const players = await prisma.player.findMany({
    include: { batting: { where: format ? { match: { format } } : undefined } },
  });
  return players
    .map((p) => {
      const innings = p.batting.filter((b: BattingStat) => !b.dnb).length;
      const runs = p.batting.reduce((s: number, b: BattingStat) => s + b.runs, 0);
      const balls = p.batting.reduce((s: number, b: BattingStat) => s + b.balls, 0);
      const fours = p.batting.reduce((s: number, b: BattingStat) => s + b.fours, 0);
      const sixes = p.batting.reduce((s: number, b: BattingStat) => s + b.sixes, 0);
      const dismissals = p.batting.filter((b: BattingStat) => !b.notOut && !b.dnb).length;
      const avg = dismissals > 0 ? runs / dismissals : runs > 0 ? null : 0;
      const sr = balls > 0 ? (runs / balls) * 100 : 0;
      const matches = new Set(p.batting.map((b: BattingStat) => b.matchId)).size;
      return { id: p.id, name: p.name, matches, innings, runs, balls, fours, sixes, dismissals, avg, sr };
    })
    .filter((p) => p.innings > 0)
    .sort((a, b) => b.runs - a.runs);
}

export async function getBowlingLeaderboard(format?: string) {
  const players = await prisma.player.findMany({
    include: { bowling: { where: format ? { match: { format } } : undefined } },
  });
  return players
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
}

export async function getExplosiveLeaderboard(format?: string) {
  const players = await prisma.player.findMany({
    include: { batting: { where: format ? { dnb: false, match: { format } } : { dnb: false } } },
  });
  return players
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
}
