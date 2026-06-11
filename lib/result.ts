type BatRow = { innings: number; team: number; runs: number; notOut: boolean; dnb: boolean };

function inningsRuns(batting: BatRow[], inningsNum: number): number {
  return batting.filter((b) => b.innings === inningsNum).reduce((s, b) => s + b.runs, 0);
}

function wicketsRemaining(batting: BatRow[], inningsNum: number): number {
  return batting.filter((b) => b.innings === inningsNum && (b.notOut || b.dnb)).length;
}

export function calculateResult(
  format: string,
  team1Name: string,
  team2Name: string,
  battingFirst: 1 | 2,
  batting: BatRow[],
): string | null {
  const inningsNums = Array.from(new Set(batting.map((b) => b.innings))).sort();
  if (inningsNums.length === 0) return null;

  const firstName = battingFirst === 1 ? team1Name : team2Name;
  const secondName = battingFirst === 1 ? team2Name : team1Name;

  if (format === "T20" || format === "ODI") {
    if (inningsNums.length < 2) return null;
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
    const maxInn = Math.max(...inningsNums);

    if (maxInn === 4) {
      // Standard 4-innings Test
      const firstTotal = inningsRuns(batting, 1) + inningsRuns(batting, 3);
      const secondTotal = inningsRuns(batting, 2) + inningsRuns(batting, 4);
      if (secondTotal > firstTotal) {
        const wk = wicketsRemaining(batting, 4);
        return `${secondName} won by ${wk} wicket${wk !== 1 ? "s" : ""}`;
      }
      if (firstTotal > secondTotal) return `${firstName} won by ${firstTotal - secondTotal} run${firstTotal - secondTotal !== 1 ? "s" : ""}`;
      return "Match drawn";
    }

    if (maxInn === 3) {
      // Follow-on scenario: one team batted twice, other once
      // Odd innings = firstName, even innings = secondName
      const firstTotal = inningsRuns(batting, 1) + (inningsNums.includes(3) ? inningsRuns(batting, 3) : 0);
      const secondTotal = inningsRuns(batting, 2);
      const diff = Math.abs(firstTotal - secondTotal);
      if (firstTotal > secondTotal) {
        return `${firstName} won by an innings and ${diff} run${diff !== 1 ? "s" : ""}`;
      }
      if (secondTotal > firstTotal) {
        return `${secondName} won by an innings and ${diff} run${diff !== 1 ? "s" : ""}`;
      }
      return "Match drawn";
    }

    if (maxInn === 2) {
      const s1 = inningsRuns(batting, 1);
      const s2 = inningsRuns(batting, 2);
      if (s1 > s2) return `${firstName} won by ${s1 - s2} run${s1 - s2 !== 1 ? "s" : ""}`;
      if (s2 > s1) {
        const wk = wicketsRemaining(batting, 2);
        return `${secondName} won by ${wk} wicket${wk !== 1 ? "s" : ""}`;
      }
      return "Match drawn";
    }
  }

  return null;
}
