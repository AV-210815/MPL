type BatRow = { innings: number; team: number; runs: number; balls: number; notOut: boolean; dnb: boolean };

function inningsRuns(batting: BatRow[], inningsNum: number): number {
  return batting.filter((b) => b.innings === inningsNum).reduce((s, b) => s + b.runs, 0);
}

function wicketsRemaining(batting: BatRow[], inningsNum: number): number {
  return batting.filter((b) => b.innings === inningsNum && (b.notOut || b.dnb)).length;
}

// An innings counts as "played" if at least one batter has runs, balls, or is not-out.
// This ignores all-zero placeholder rows that get submitted for unplayed Test innings.
function inningsPlayed(batting: BatRow[], inningsNum: number): boolean {
  return batting.filter((b) => b.innings === inningsNum).some((b) => b.runs > 0 || b.balls > 0 || b.notOut);
}

export function calculateResult(
  format: string,
  team1Name: string,
  team2Name: string,
  battingFirst: 1 | 2,
  batting: BatRow[],
): string | null {
  const allInnings = Array.from(new Set(batting.map((b) => b.innings))).sort();
  if (allInnings.length === 0) return null;

  const firstName = battingFirst === 1 ? team1Name : team2Name;
  const secondName = battingFirst === 1 ? team2Name : team1Name;

  if (format === "T20" || format === "ODI") {
    if (allInnings.length < 2) return null;
    const s1 = inningsRuns(batting, 1);
    const s2 = inningsRuns(batting, 2);
    if (s2 > s1) {
      const wk = wicketsRemaining(batting, 2);
      return `${secondName} won by ${wk} wicket${wk !== 1 ? "s" : ""}`;
    }
    if (s1 > s2) return `${firstName} won by ${s1 - s2} run${s1 - s2 !== 1 ? "s" : ""}`;
    return "Match tied";
  }

  if (format === "TEST") {
    // Only consider innings that were actually played, not empty placeholder rows.
    const played = allInnings.filter((n) => inningsPlayed(batting, n));
    if (played.length < 2) return null;
    const maxPlayed = Math.max(...played);

    if (maxPlayed === 4) {
      const firstTotal = inningsRuns(batting, 1) + inningsRuns(batting, 3);
      const secondTotal = inningsRuns(batting, 2) + inningsRuns(batting, 4);
      if (secondTotal > firstTotal) {
        const wk = wicketsRemaining(batting, 4);
        return `${secondName} won by ${wk} wicket${wk !== 1 ? "s" : ""}`;
      }
      if (firstTotal > secondTotal) return `${firstName} won by ${firstTotal - secondTotal} run${firstTotal - secondTotal !== 1 ? "s" : ""}`;
      return "Match drawn";
    }

    if (maxPlayed === 3) {
      // Innings victory: one team's single innings beat both innings of the other
      const firstTotal = inningsRuns(batting, 1) + (played.includes(3) ? inningsRuns(batting, 3) : 0);
      const secondTotal = inningsRuns(batting, 2);
      const diff = Math.abs(firstTotal - secondTotal);
      if (firstTotal > secondTotal) return `${firstName} won by an innings and ${diff} run${diff !== 1 ? "s" : ""}`;
      if (secondTotal > firstTotal) return `${secondName} won by an innings and ${diff} run${diff !== 1 ? "s" : ""}`;
      return "Match drawn";
    }

    // Only 2 innings played — match in progress, show who leads
    const s1 = inningsRuns(batting, 1);
    const s2 = inningsRuns(batting, 2);
    const diff = Math.abs(s1 - s2);
    if (s1 > s2) return `${firstName} lead by ${diff} run${diff !== 1 ? "s" : ""}`;
    if (s2 > s1) return `${secondName} lead by ${diff} run${diff !== 1 ? "s" : ""}`;
    return "Teams level";
  }

  return null;
}
