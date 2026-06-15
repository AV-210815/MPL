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

type RawStats = {
  id: number;
  innings: { runs: number; balls: number; notOut: boolean; sixes: number; fours: number }[];
  bowling: { wickets: number; runsConceded: number; overs: number; maidens: number }[];
  potmCount: number;
  matchCount: number;
};

type Achievement = {
  icon: string;
  label: string;
  score: (p: RawStats) => number;
  minScore: number;
  desc: (p: RawStats) => string;
};

// Ordered by prestige — first match per player wins, each badge goes to exactly one player
const ACHIEVEMENTS: Achievement[] = [
  {
    icon: "💯", label: "Century King",
    score: (p) => p.innings.length > 0 ? Math.max(...p.innings.map((i) => i.runs)) : 0,
    minScore: 100,
    desc: (p) => `Scored ${Math.max(...p.innings.map((i) => i.runs))} in a single innings`,
  },
  {
    icon: "👑", label: "POTM Star",
    score: (p) => p.potmCount,
    minScore: 1,
    desc: (p) => p.potmCount === 1 ? "Player of the Match" : `${p.potmCount}× Player of the Match`,
  },
  {
    icon: "🎳", label: "Wicket Hunter",
    score: (p) => p.bowling.reduce((s, b) => s + b.wickets, 0),
    minScore: 3,
    desc: (p) => `${p.bowling.reduce((s, b) => s + b.wickets, 0)} career wickets`,
  },
  {
    icon: "🎯", label: "Triple Threat",
    score: (p) => p.bowling.length > 0 ? Math.max(...p.bowling.map((b) => b.wickets)) : 0,
    minScore: 3,
    desc: (p) => `${Math.max(...p.bowling.map((b) => b.wickets))} wickets in a spell`,
  },
  {
    icon: "⭐", label: "All-Rounder",
    score: (p) => {
      const runs = p.innings.reduce((s, b) => s + b.runs, 0);
      const wickets = p.bowling.reduce((s, b) => s + b.wickets, 0);
      return p.innings.length >= 3 && wickets >= 2 ? runs + wickets * 15 : 0;
    },
    minScore: 1,
    desc: (p) => {
      const runs = p.innings.reduce((s, b) => s + b.runs, 0);
      const wickets = p.bowling.reduce((s, b) => s + b.wickets, 0);
      return `${runs} runs & ${wickets} wickets`;
    },
  },
  {
    icon: "🧱", label: "The Wall",
    score: (p) => {
      const runs = p.innings.reduce((s, b) => s + b.runs, 0);
      const dismissals = p.innings.filter((b) => !b.notOut).length;
      return dismissals >= 3 ? runs / dismissals : 0;
    },
    minScore: 25,
    desc: (p) => {
      const runs = p.innings.reduce((s, b) => s + b.runs, 0);
      const dismissals = p.innings.filter((b) => !b.notOut).length;
      return `Batting avg ${(runs / dismissals).toFixed(1)}`;
    },
  },
  {
    icon: "🔥", label: "Quick Fire",
    score: (p) => {
      const runs = p.innings.reduce((s, b) => s + b.runs, 0);
      const balls = p.innings.reduce((s, b) => s + b.balls, 0);
      return balls >= 20 ? (runs / balls) * 100 : 0;
    },
    minScore: 130,
    desc: (p) => {
      const runs = p.innings.reduce((s, b) => s + b.runs, 0);
      const balls = p.innings.reduce((s, b) => s + b.balls, 0);
      return `SR ${((runs / balls) * 100).toFixed(0)}`;
    },
  },
  {
    icon: "💥", label: "Six Machine",
    score: (p) => p.innings.reduce((s, b) => s + b.sixes, 0),
    minScore: 3,
    desc: (p) => `${p.innings.reduce((s, b) => s + b.sixes, 0)} career sixes`,
  },
  {
    icon: "⚡", label: "Fifty Club",
    score: (p) => p.innings.filter((b) => b.runs >= 50).length,
    minScore: 1,
    desc: (p) => `${p.innings.filter((b) => b.runs >= 50).length} half-centur${p.innings.filter((b) => b.runs >= 50).length === 1 ? "y" : "ies"}`,
  },
  {
    icon: "🏃", label: "Run Machine",
    score: (p) => p.innings.reduce((s, b) => s + b.runs, 0),
    minScore: 50,
    desc: (p) => `${p.innings.reduce((s, b) => s + b.runs, 0)} career runs`,
  },
  {
    icon: "🏏", label: "Boundary King",
    score: (p) => p.innings.reduce((s, b) => s + b.fours + b.sixes, 0),
    minScore: 5,
    desc: (p) => `${p.innings.reduce((s, b) => s + b.fours + b.sixes, 0)} boundaries`,
  },
  {
    icon: "🧊", label: "Economy King",
    score: (p) => {
      const overs = p.bowling.reduce((s, b) => s + b.overs, 0);
      const runs = p.bowling.reduce((s, b) => s + b.runsConceded, 0);
      return overs >= 3 ? 100 - runs / overs : 0;
    },
    minScore: 1,
    desc: (p) => {
      const overs = p.bowling.reduce((s, b) => s + b.overs, 0);
      const runs = p.bowling.reduce((s, b) => s + b.runsConceded, 0);
      return `Economy ${(runs / overs).toFixed(1)} RPO`;
    },
  },
  {
    icon: "🤫", label: "Silent Killer",
    score: (p) => p.bowling.reduce((s, b) => s + b.maidens, 0),
    minScore: 1,
    desc: (p) => `${p.bowling.reduce((s, b) => s + b.maidens, 0)} maiden overs`,
  },
  {
    icon: "🛡️", label: "Survivor",
    score: (p) => p.innings.filter((b) => b.notOut).length,
    minScore: 2,
    desc: (p) => `${p.innings.filter((b) => b.notOut).length} not-out innings`,
  },
  {
    icon: "📈", label: "Hot Streak",
    score: (p) => {
      const recent = p.innings.slice(0, 3);
      return recent.length >= 2 ? recent.reduce((s, b) => s + b.runs, 0) : 0;
    },
    minScore: 50,
    desc: (p) => {
      const recent = p.innings.slice(0, 3);
      return `${recent.reduce((s, b) => s + b.runs, 0)} runs in last ${recent.length} innings`;
    },
  },
  {
    icon: "🏆", label: "Iron Man",
    score: (p) => p.matchCount,
    minScore: 5,
    desc: (p) => `Played ${p.matchCount} matches`,
  },
];

// Greedy assignment: each achievement goes to the highest scorer who hasn't been assigned yet.
// Each player ends up with at most one badge.
function assignAchievements(players: RawStats[]): Map<number, { icon: string; label: string; desc: string }> {
  const assigned = new Map<number, { icon: string; label: string; desc: string }>();
  const takenPlayerIds = new Set<number>();

  for (const ach of ACHIEVEMENTS) {
    let bestPlayer: RawStats | null = null;
    let bestScore = ach.minScore - 0.0001;

    for (const p of players) {
      if (takenPlayerIds.has(p.id)) continue;
      const s = ach.score(p);
      if (s > bestScore) {
        bestPlayer = p;
        bestScore = s;
      }
    }

    if (bestPlayer) {
      takenPlayerIds.add(bestPlayer.id);
      assigned.set(bestPlayer.id, {
        icon: ach.icon,
        label: ach.label,
        desc: ach.desc(bestPlayer),
      });
    }
  }

  return assigned;
}

export async function GET(req: NextRequest) {
  try {
    const apartmentId = await getApartmentId(req);
    const players = await prisma.player.findMany({
      where: { apartmentId },
      orderBy: { name: "asc" },
      include: {
        batting: {
          where: { dnb: false },
          include: { match: { select: { date: true } } },
          orderBy: { match: { date: "desc" } },
        },
        bowling: true,
        potmMatches: { select: { id: true } },
      },
    });

    const rawStats: RawStats[] = players.map((p) => {
      const matchIds = new Set([
        ...p.batting.map((b) => b.matchId),
        ...p.bowling.map((b) => b.matchId),
      ]);
      return {
        id: p.id,
        innings: p.batting.map((b) => ({
          runs: b.runs, balls: b.balls, notOut: b.notOut, sixes: b.sixes, fours: b.fours,
        })),
        bowling: p.bowling.map((b) => ({
          wickets: b.wickets, runsConceded: b.runsConceded, overs: b.overs, maidens: b.maidens,
        })),
        potmCount: p.potmMatches.length,
        matchCount: matchIds.size,
      };
    });

    const achievementMap = assignAchievements(rawStats);

    const profiles = players.map((p) => {
      const innings = p.batting;
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

      const bestBattingInning = innings.reduce<typeof innings[0] | null>(
        (best, b) => (best === null || b.runs > best.runs ? b : best), null
      );
      const bestBatting = bestBattingInning
        ? { runs: bestBattingInning.runs, notOut: bestBattingInning.notOut }
        : null;

      const bestBowlingSpell = p.bowling.reduce<typeof p.bowling[0] | null>(
        (best, b) => {
          if (best === null) return b;
          if (b.wickets > best.wickets) return b;
          if (b.wickets === best.wickets && b.runsConceded < best.runsConceded) return b;
          return best;
        }, null
      );
      const bestBowling = bestBowlingSpell && bestBowlingSpell.wickets > 0
        ? { wickets: bestBowlingSpell.wickets, runsConceded: bestBowlingSpell.runsConceded }
        : null;

      const matchIds = new Set([
        ...innings.map((b) => b.matchId),
        ...p.bowling.map((b) => b.matchId),
      ]);
      const matchCount = matchIds.size;
      const potmCount = p.potmMatches.length;

      const recentForm = innings.slice(0, 5).map((b) => ({ runs: b.runs, notOut: b.notOut }));

      const badge = achievementMap.get(p.id);
      const badges = badge ? [badge] : [];

      return {
        id: p.id,
        name: p.name,
        photo: p.photo ?? null,
        matches: matchCount,
        batting: { innings: innings.length, runs, avg, sr, hundreds, fifties, fours, sixes, bestScore: bestBatting },
        bowling: { wickets, maidens, overs, runsConceded, economy, avg: bowlingAvg, bestFigures: bestBowling },
        recentForm,
        badges,
        potmCount,
      };
    });

    return NextResponse.json(profiles);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
