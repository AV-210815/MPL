import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import MatchForm from "@/components/MatchForm";
import type { InitialData } from "@/components/MatchForm";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditMatchPage({ params }: Props) {
  const { id } = await params;
  const matchId = Number(id);

  const [match, players] = await Promise.all([
    prisma.match.findUnique({
      where: { id: matchId },
      include: {
        members: true,
        batting: { orderBy: [{ innings: "asc" }, { id: "asc" }] },
        bowling: { orderBy: [{ innings: "asc" }, { id: "asc" }] },
      },
    }),
    prisma.player.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!match) notFound();

  // Group stats by innings number
  const allInningsNums = Array.from(new Set([...match.batting.map((b) => b.innings), ...match.bowling.map((b) => b.innings)])).sort();
  const battingFirst = (match.battingFirst as 1 | 2) ?? 1;

  function battingTeamForInnings(n: number): 1 | 2 {
    return n % 2 === 1 ? battingFirst : battingFirst === 1 ? 2 : 1;
  }

  const innings = allInningsNums.length > 0
    ? allInningsNums.map((n) => {
        const bt = battingTeamForInnings(n);
        const bwt: 1 | 2 = bt === 1 ? 2 : 1;

        // Players in each team
        const t1ids = match.members.filter((m) => m.team === 1).map((m) => m.playerId);
        const t2ids = match.members.filter((m) => m.team === 2).map((m) => m.playerId);
        const batTeamIds = bt === 1 ? t1ids : t2ids;
        const bowlTeamIds = bwt === 1 ? t1ids : t2ids;

        return {
          inningsNum: n,
          battingTeam: bt,
          batting: batTeamIds.map((pid) => {
            const s = match.batting.find((b) => b.playerId === pid && b.innings === n);
            return s
              ? { playerId: pid, runs: s.runs, balls: s.balls, fours: s.fours, sixes: s.sixes, notOut: s.notOut, dnb: s.dnb, dismissal: (s as any).dismissal ?? "" }
              : { playerId: pid, runs: 0, balls: 0, fours: 0, sixes: 0, notOut: false, dnb: false, dismissal: "" };
          }),
          bowling: bowlTeamIds.map((pid) => {
            const s = match.bowling.find((b) => b.playerId === pid && b.innings === n);
            return s
              ? { playerId: pid, wickets: s.wickets, overs: s.overs, runsConceded: s.runsConceded, maidens: s.maidens }
              : { playerId: pid, wickets: 0, overs: 0, runsConceded: 0, maidens: 0 };
          }),
        };
      })
    : [];

  const initial: InitialData = {
    details: {
      format: (match.format as "TEST" | "ODI" | "T20") ?? "ODI",
      date: match.date.toISOString().split("T")[0],
      label: match.label ?? "",
      season: (match as any).season ?? "",
      team1Name: match.team1Name ?? "Team 1",
      team2Name: match.team2Name ?? "Team 2",
      battingFirst,
    },
    members: match.members.map((m) => ({ playerId: m.playerId, team: m.team as 1 | 2 })),
    innings,
    potmId: match.potmId ?? null,
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <div className="w-1 h-8 rounded-full bg-blue-500" />
        <h1 className="text-2xl font-black text-white">
          Edit {match.label ?? `Match #${match.id}`}
        </h1>
      </div>
      <MatchForm players={players} matchId={matchId} initial={initial} />
    </div>
  );
}
