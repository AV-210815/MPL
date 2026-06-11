import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { calculateResult } from "@/lib/result";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const match = await prisma.match.findUnique({
      where: { id: Number(id) },
      include: {
        members: { include: { player: true } },
        batting: { include: { player: true }, orderBy: [{ innings: "asc" }, { id: "asc" }] },
        bowling: { include: { player: true }, orderBy: [{ innings: "asc" }, { id: "asc" }] },
      },
    });
    if (!match) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(match);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

type BattingInput = { playerId: number; innings: number; team: number; runs: number; balls: number; fours: number; sixes: number; notOut: boolean; dnb: boolean };
type BowlingInput = { playerId: number; innings: number; team: number; wickets: number; overs: number; runsConceded: number; maidens: number };
type MemberInput = { playerId: number; team: number };

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const matchId = Number(id);
    const { date, label, format, team1Name, team2Name, battingFirst, members, batting, bowling } = await req.json();

    const resolvedFormat = format ?? "ODI";
    const resolvedTeam1 = team1Name ?? "Team 1";
    const resolvedTeam2 = team2Name ?? "Team 2";
    const resolvedBattingFirst = battingFirst ?? 1;
    const battingRows = (batting ?? []).map((b: BattingInput) => ({ innings: b.innings ?? 1, team: b.team ?? 1, runs: b.runs, notOut: b.notOut ?? false, dnb: b.dnb ?? false }));
    const result = calculateResult(resolvedFormat, resolvedTeam1, resolvedTeam2, resolvedBattingFirst as 1 | 2, battingRows);

    await prisma.$transaction([
      prisma.matchTeamMember.deleteMany({ where: { matchId } }),
      prisma.battingStat.deleteMany({ where: { matchId } }),
      prisma.bowlingStat.deleteMany({ where: { matchId } }),
      prisma.match.update({
        where: { id: matchId },
        data: {
          date: new Date(date),
          label: label || null,
          format: resolvedFormat,
          team1Name: resolvedTeam1,
          team2Name: resolvedTeam2,
          battingFirst: resolvedBattingFirst,
          result: result ?? null,
          members: { create: (members ?? []).map((m: MemberInput) => ({ playerId: m.playerId, team: m.team })) },
          batting: { create: (batting ?? []).map((b: BattingInput) => ({ playerId: b.playerId, innings: b.innings ?? 1, team: b.team ?? 1, runs: b.runs, balls: b.balls, fours: b.fours, sixes: b.sixes, notOut: b.notOut ?? false, dnb: b.dnb ?? false })) },
          bowling: { create: (bowling ?? []).map((b: BowlingInput) => ({ playerId: b.playerId, innings: b.innings ?? 1, team: b.team ?? 1, wickets: b.wickets, overs: b.overs, runsConceded: b.runsConceded, maidens: b.maidens })) },
        },
      }),
    ]);

    const updated = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        members: { include: { player: true } },
        batting: { include: { player: true } },
        bowling: { include: { player: true } },
      },
    });
    return NextResponse.json(updated);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.match.delete({ where: { id: Number(id) } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
