import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { calculateResult } from "@/lib/result";

export async function GET(req: NextRequest) {
  try {
    const date = req.nextUrl.searchParams.get("date");
    const where = date
      ? { date: { gte: new Date(`${date}T00:00:00.000Z`), lte: new Date(`${date}T23:59:59.999Z`) } }
      : {};

    const matches = await prisma.match.findMany({
      where,
      orderBy: { date: "desc" },
      include: {
        members: { include: { player: true } },
        batting: { include: { player: true }, orderBy: [{ innings: "asc" }, { id: "asc" }] },
        bowling: { include: { player: true }, orderBy: [{ innings: "asc" }, { id: "asc" }] },
      },
    });
    return NextResponse.json(matches);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

type BattingInput = { playerId: number; innings: number; team: number; runs: number; balls: number; fours: number; sixes: number; notOut: boolean; dnb: boolean };
type BowlingInput = { playerId: number; innings: number; team: number; wickets: number; overs: number; runsConceded: number; maidens: number };
type MemberInput = { playerId: number; team: number };

export async function POST(req: NextRequest) {
  try {
    const { date, label, format, team1Name, team2Name, battingFirst, members, batting, bowling } = await req.json();
    if (!date) return NextResponse.json({ error: "Date required" }, { status: 400 });

    const resolvedFormat = format ?? "ODI";
    const resolvedTeam1 = team1Name ?? "Team 1";
    const resolvedTeam2 = team2Name ?? "Team 2";
    const resolvedBattingFirst = battingFirst ?? 1;
    const battingRows = (batting ?? []).map((b: BattingInput) => ({ innings: b.innings ?? 1, team: b.team ?? 1, runs: b.runs, notOut: b.notOut ?? false, dnb: b.dnb ?? false }));
    const result = calculateResult(resolvedFormat, resolvedTeam1, resolvedTeam2, resolvedBattingFirst as 1 | 2, battingRows);

    const match = await prisma.match.create({
      data: {
        date: new Date(date),
        label: label || null,
        format: resolvedFormat,
        team1Name: resolvedTeam1,
        team2Name: resolvedTeam2,
        battingFirst: resolvedBattingFirst,
        result: result ?? undefined,
        members: { create: (members ?? []).map((m: MemberInput) => ({ playerId: m.playerId, team: m.team })) },
        batting: { create: (batting ?? []).map((b: BattingInput) => ({ playerId: b.playerId, innings: b.innings ?? 1, team: b.team ?? 1, runs: b.runs, balls: b.balls, fours: b.fours, sixes: b.sixes, notOut: b.notOut ?? false, dnb: b.dnb ?? false })) },
        bowling: { create: (bowling ?? []).map((b: BowlingInput) => ({ playerId: b.playerId, innings: b.innings ?? 1, team: b.team ?? 1, wickets: b.wickets, overs: b.overs, runsConceded: b.runsConceded, maidens: b.maidens })) },
      },
      include: {
        members: { include: { player: true } },
        batting: { include: { player: true } },
        bowling: { include: { player: true } },
      },
    });
    return NextResponse.json(match, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
