import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { calculateResult } from "@/lib/result";
import { verifyToken } from "@/lib/jwt";

async function getApartmentId(req: NextRequest): Promise<number> {
  const slug = req.nextUrl.searchParams.get("slug");
  if (slug) {
    const apt = await prisma.apartment.findUnique({ where: { slug } });
    return apt?.id ?? 1;
  }
  try {
    const token = req.cookies.get("mpl-token")?.value;
    if (!token) return 1;
    const payload = await verifyToken(token);
    return payload.apartmentId ?? 1;
  } catch { return 1; }
}

export async function GET(req: NextRequest) {
  try {
    const apartmentId = await getApartmentId(req);
    const date = req.nextUrl.searchParams.get("date");
    const season = req.nextUrl.searchParams.get("season");
    const where = {
      apartmentId,
      ...(date ? { date: { gte: new Date(`${date}T00:00:00.000Z`), lte: new Date(`${date}T23:59:59.999Z`) } } : {}),
      ...(season ? { season } : {}),
    };

    const matches = await prisma.match.findMany({
      where,
      orderBy: { date: "desc" },
      include: {
        potm: { select: { id: true, name: true } },
        members: { include: { player: true } },
        batting: { include: { player: true }, orderBy: [{ innings: "asc" }, { id: "asc" }] },
        bowling: { include: { player: true }, orderBy: [{ innings: "asc" }, { id: "asc" }] },
      },
    });

    // Merge dismissals via raw SQL (cached Prisma client doesn't know about this column yet)
    if (matches.length > 0) {
      const ids = matches.flatMap((m) => m.batting.map((b) => b.id));
      if (ids.length > 0) {
        const rows = await prisma.$queryRawUnsafe<{ id: number; dismissal: string | null }[]>(
          `SELECT id, dismissal FROM BattingStat WHERE id IN (${ids.join(",")})`
        );
        const map = new Map(rows.map((r) => [r.id, r.dismissal]));
        for (const m of matches) {
          for (const b of m.batting) { (b as any).dismissal = map.get(b.id) ?? null; }
        }
      }
    }

    return NextResponse.json(matches);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

type BattingInput = { playerId: number; innings: number; team: number; runs: number; balls: number; fours: number; sixes: number; notOut: boolean; dnb: boolean; dismissal?: string };
type BowlingInput = { playerId: number; innings: number; team: number; wickets: number; overs: number; runsConceded: number; maidens: number };
type MemberInput = { playerId: number; team: number };

export async function POST(req: NextRequest) {
  try {
    const apartmentId = await getApartmentId(req);
    const { date, label, season, format, team1Name, team2Name, battingFirst, potmId, members, batting, bowling } = await req.json();
    if (!date) return NextResponse.json({ error: "Date required" }, { status: 400 });

    const resolvedFormat = format ?? "ODI";
    const resolvedTeam1 = team1Name ?? "Team 1";
    const resolvedTeam2 = team2Name ?? "Team 2";
    const resolvedBattingFirst = battingFirst ?? 1;
    const battingRows = (batting ?? []).map((b: BattingInput) => ({ innings: b.innings ?? 1, team: b.team ?? 1, runs: b.runs, balls: b.balls ?? 0, notOut: b.notOut ?? false, dnb: b.dnb ?? false }));
    const result = calculateResult(resolvedFormat, resolvedTeam1, resolvedTeam2, resolvedBattingFirst as 1 | 2, battingRows);

    const match = await prisma.match.create({
      data: {
        apartmentId,
        date: new Date(date),
        label: label || null,
        season: season || null,
        format: resolvedFormat,
        team1Name: resolvedTeam1,
        team2Name: resolvedTeam2,
        battingFirst: resolvedBattingFirst,
        result: result ?? undefined,
        potmId: potmId ?? null,
        members: { create: (members ?? []).map((m: MemberInput) => ({ playerId: m.playerId, team: m.team })) },
        batting: { create: (batting ?? []).map((b: BattingInput) => ({ playerId: b.playerId, innings: b.innings ?? 1, team: b.team ?? 1, runs: b.runs, balls: b.balls, fours: b.fours, sixes: b.sixes, notOut: b.notOut ?? false, dnb: b.dnb ?? false })) },
        bowling: { create: (bowling ?? []).map((b: BowlingInput) => ({ playerId: b.playerId, innings: b.innings ?? 1, team: b.team ?? 1, wickets: b.wickets, overs: b.overs, runsConceded: b.runsConceded, maidens: b.maidens })) },
      },
      include: {
        potm: { select: { id: true, name: true } },
        members: { include: { player: true } },
        batting: { include: { player: true } },
        bowling: { include: { player: true } },
      },
    });

    // Write dismissals via raw SQL to avoid stale Prisma client validation
    for (const b of (batting ?? []) as BattingInput[]) {
      if (b.dismissal) {
        const inn = b.innings ?? 1;
        await prisma.$executeRaw`UPDATE BattingStat SET dismissal = ${b.dismissal} WHERE matchId = ${match.id} AND playerId = ${b.playerId} AND innings = ${inn}`;
      }
    }

    return NextResponse.json(match, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
