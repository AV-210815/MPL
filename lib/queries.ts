import { prisma } from "@/lib/db";
import type { BattingStat, BowlingStat } from "@/app/generated/prisma/client";

function matchFilter(format?: string, season?: string) {
  if (!format && !season) return undefined;
  return { ...(format ? { format } : {}), ...(season ? { season } : {}) };
}

export async function getBattingLeaderboard(apartmentId: number, format?: string, season?: string) {
  const mf = matchFilter(format, season);
  const players = await prisma.player.findMany({
    where: { apartmentId },
    include: { batting: { where: mf ? { match: mf } : undefined } },
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

export async function getBowlingLeaderboard(apartmentId: number, format?: string, season?: string) {
  const mf = matchFilter(format, season);
  const players = await prisma.player.findMany({
    where: { apartmentId },
    include: { bowling: { where: mf ? { match: mf } : undefined } },
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

export async function getBattingLeaderboardMulti(apartmentIds: number[], format?: string) {
  const players = await prisma.player.findMany({
    where: { apartmentId: { in: apartmentIds } },
    include: {
      batting: { where: format ? { match: { format } } : undefined },
      apartment: { select: { name: true, slug: true } },
    },
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
      return { id: p.id, name: p.name, league: p.apartment.name, leagueSlug: p.apartment.slug, matches, innings, runs, balls, fours, sixes, dismissals, avg, sr };
    })
    .filter((p) => p.innings > 0)
    .sort((a, b) => b.runs - a.runs);
}

export async function getBowlingLeaderboardMulti(apartmentIds: number[], format?: string) {
  const players = await prisma.player.findMany({
    where: { apartmentId: { in: apartmentIds } },
    include: {
      bowling: { where: format ? { match: { format } } : undefined },
      apartment: { select: { name: true, slug: true } },
    },
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
      return { id: p.id, name: p.name, league: p.apartment.name, leagueSlug: p.apartment.slug, matches, innings, wickets, overs, runsConceded, maidens, economy, avg };
    })
    .filter((p) => p.innings > 0)
    .sort((a, b) => b.wickets - a.wickets || a.economy - b.economy);
}

export async function getExplosiveLeaderboard(apartmentId: number, format?: string, season?: string) {
  const mf = matchFilter(format, season);
  const players = await prisma.player.findMany({
    where: { apartmentId },
    include: { batting: { where: mf ? { dnb: false, match: mf } : { dnb: false } } },
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

export async function getRivalries(apartmentId: number) {
  const players = await prisma.player.findMany({
    where: { apartmentId },
    select: { id: true, name: true },
  });
  const playerById = new Map(players.map((p) => [p.id, p.name]));
  const playerNames = new Set(players.map((p) => p.name));

  const rows = await prisma.$queryRaw<{ playerId: number; dismissal: string }[]>`
    SELECT bs.playerId, bs.dismissal FROM BattingStat bs
    JOIN Match m ON bs.matchId = m.id
    WHERE m.apartmentId = ${apartmentId} AND bs.dismissal IS NOT NULL AND bs.dismissal != ''
  `;

  function extractBowler(d: string): string | null {
    if (d.startsWith("b ")) return d.slice(2).trim();
    if (d.startsWith("c&b ")) return d.slice(4).trim();
    if (d.startsWith("lbw ")) return d.slice(4).trim();
    if (d.startsWith("hw ")) return d.slice(3).trim();
    if (d.startsWith("st ")) { const i = d.indexOf(" b "); return i >= 0 ? d.slice(i + 3).trim() : null; }
    if (d.startsWith("c ") && d.includes(" b ")) { const i = d.indexOf(" b "); return d.slice(i + 3).trim(); }
    return null;
  }

  const bowlerVsBatter: Record<string, Record<number, number>> = {};
  const batterVsBowler: Record<number, Record<string, number>> = {};

  for (const row of rows) {
    const bowlerName = extractBowler(row.dismissal);
    if (!bowlerName || !playerNames.has(bowlerName)) continue;
    bowlerVsBatter[bowlerName] ??= {};
    bowlerVsBatter[bowlerName][row.playerId] = (bowlerVsBatter[bowlerName][row.playerId] ?? 0) + 1;
    batterVsBowler[row.playerId] ??= {};
    batterVsBowler[row.playerId][bowlerName] = (batterVsBowler[row.playerId][bowlerName] ?? 0) + 1;
  }

  const favouriteVictims = players.flatMap((p) => {
    const victims = bowlerVsBatter[p.name];
    if (!victims) return [];
    const sorted = Object.entries(victims).sort((a, b) => b[1] - a[1]);
    if (!sorted.length || sorted[0][1] < 2) return [];
    const name = playerById.get(Number(sorted[0][0]));
    if (!name) return [];
    return [{ bowler: p.name, victim: name, count: sorted[0][1] }];
  }).sort((a, b) => b.count - a.count);

  const nemeses = players.flatMap((p) => {
    const bowlers = batterVsBowler[p.id];
    if (!bowlers) return [];
    const sorted = Object.entries(bowlers).sort((a, b) => b[1] - a[1]);
    if (!sorted.length || sorted[0][1] < 2) return [];
    return [{ batter: p.name, nemesis: sorted[0][0], count: sorted[0][1] }];
  }).sort((a, b) => b.count - a.count);

  return { favouriteVictims, nemeses };
}

const RUN_MILESTONES = [50, 100, 200, 300, 500, 750, 1000];
const WICKET_MILESTONES = [5, 10, 15, 20, 25, 30];

export async function getMilestones(apartmentId: number) {
  const players = await prisma.player.findMany({
    where: { apartmentId },
    include: { batting: { where: { dnb: false } }, bowling: true },
  });

  const batting = players.map((p) => {
    const current = p.batting.reduce((s, b) => s + (b as BattingStat).runs, 0);
    const nextMilestone = RUN_MILESTONES.find((m) => m > current) ?? null;
    const gap = nextMilestone !== null ? nextMilestone - current : null;
    const idx = nextMilestone !== null ? RUN_MILESTONES.indexOf(nextMilestone) : RUN_MILESTONES.length;
    const prevMilestone = idx > 0 ? RUN_MILESTONES[idx - 1] : 0;
    return { id: p.id, name: p.name, current, nextMilestone, gap, prevMilestone };
  }).filter((p) => p.gap !== null && p.current > 0).sort((a, b) => (a.gap ?? Infinity) - (b.gap ?? Infinity));

  const bowling = players.map((p) => {
    const current = p.bowling.reduce((s, b) => s + (b as BowlingStat).wickets, 0);
    const nextMilestone = WICKET_MILESTONES.find((m) => m > current) ?? null;
    const gap = nextMilestone !== null ? nextMilestone - current : null;
    const idx = nextMilestone !== null ? WICKET_MILESTONES.indexOf(nextMilestone) : WICKET_MILESTONES.length;
    const prevMilestone = idx > 0 ? WICKET_MILESTONES[idx - 1] : 0;
    return { id: p.id, name: p.name, current, nextMilestone, gap, prevMilestone };
  }).filter((p) => p.gap !== null && p.current > 0).sort((a, b) => (a.gap ?? Infinity) - (b.gap ?? Infinity));

  return { batting, bowling };
}

export async function getStandings(apartmentId: number) {
  const matches = await prisma.match.findMany({
    where: { apartmentId, result: { not: null } },
    include: { members: { include: { player: { select: { id: true, name: true } } } } },
  });

  const stats = new Map<number, { id: number; name: string; W: number; L: number; T: number; D: number }>();

  for (const match of matches) {
    const { result, team1Name, team2Name } = match;
    if (!result) continue;
    let t1r: "W" | "L" | "T" | "D" = "D";
    let t2r: "W" | "L" | "T" | "D" = "D";
    if (result.includes(`${team1Name} won`)) { t1r = "W"; t2r = "L"; }
    else if (result.includes(`${team2Name} won`)) { t1r = "L"; t2r = "W"; }
    else if (result === "Match tied") { t1r = "T"; t2r = "T"; }
    for (const member of match.members) {
      const { playerId, team } = member;
      if (!stats.has(playerId)) stats.set(playerId, { id: playerId, name: member.player.name, W: 0, L: 0, T: 0, D: 0 });
      stats.get(playerId)![team === 1 ? t1r : t2r]++;
    }
  }

  return Array.from(stats.values()).map((s) => {
    const M = s.W + s.L + s.T + s.D;
    const pts = s.W * 2 + s.T;
    const winPct = M > 0 ? ((s.W + 0.5 * s.T) / M) * 100 : 0;
    return { ...s, M, pts, winPct };
  }).filter((s) => s.M > 0).sort((a, b) => b.pts - a.pts || b.winPct - a.winPct || b.W - a.W);
}

export async function getSeasons(apartmentId: number): Promise<string[]> {
  const matches = await prisma.match.findMany({
    where: { apartmentId, season: { not: null } },
    select: { season: true },
    distinct: ["season"],
    orderBy: { season: "asc" },
  });
  return matches.map((m) => m.season!).filter(Boolean);
}
