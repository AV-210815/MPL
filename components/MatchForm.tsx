"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Player { id: number; name: string }

type Format = "TEST" | "ODI" | "T20";

interface MatchDetails {
  format: Format;
  date: string;
  label: string;
  season: string;
  team1Name: string;
  team2Name: string;
  battingFirst: 1 | 2;
}

interface Teams {
  team1: number[];
  team2: number[];
  pool: number[];
}

interface BattingEntry {
  playerId: number;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  notOut: boolean;
  dnb: boolean;
  dismissal: string; // "b PlayerName", "ro FielderName", or ""
}

interface BowlingEntry {
  playerId: number;
  wickets: number;
  overs: number;
  runsConceded: number;
  maidens: number;
}

interface InningsData {
  inningsNum: number;
  battingTeam: 1 | 2;
  batting: BattingEntry[];
  bowling: BowlingEntry[];
}

export interface InitialData {
  details: MatchDetails;
  members: { playerId: number; team: 1 | 2 }[];
  innings: InningsData[];
  potmId?: number | null;
}

interface Props {
  players: Player[];
  matchId?: number;
  initial?: InitialData;
  redirectTo?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function battingTeamForInnings(n: number, first: 1 | 2): 1 | 2 {
  return n % 2 === 1 ? first : first === 1 ? 2 : 1;
}

function buildInnings(teams: Teams, details: MatchDetails): InningsData[] {
  const count = 2;
  return Array.from({ length: count }, (_, i) => {
    const n = i + 1;
    const bt = battingTeamForInnings(n, details.battingFirst);
    const bwt: 1 | 2 = bt === 1 ? 2 : 1;
    return {
      inningsNum: n,
      battingTeam: bt,
      batting: teams[`team${bt}` as "team1" | "team2"].map((pid) => ({ playerId: pid, runs: 0, balls: 0, fours: 0, sixes: 0, notOut: false, dnb: false, dismissal: "" })),
      bowling: teams[`team${bwt}` as "team1" | "team2"].map((pid) => ({ playerId: pid, wickets: 0, overs: 0, runsConceded: 0, maidens: 0 })),
    };
  });
}

function addTestInnings(prev: InningsData[], details: MatchDetails, teams: Teams): InningsData[] {
  const n = prev.length + 1;
  const bt = battingTeamForInnings(n, details.battingFirst);
  const bwt: 1 | 2 = bt === 1 ? 2 : 1;
  return [
    ...prev,
    {
      inningsNum: n,
      battingTeam: bt,
      batting: teams[`team${bt}` as "team1" | "team2"].map((pid) => ({ playerId: pid, runs: 0, balls: 0, fours: 0, sixes: 0, notOut: false, dnb: false, dismissal: "" })),
      bowling: teams[`team${bwt}` as "team1" | "team2"].map((pid) => ({ playerId: pid, wickets: 0, overs: 0, runsConceded: 0, maidens: 0 })),
    },
  ];
}

// ─── Shared styles ────────────────────────────────────────────────────────────

const inp = "bg-white/5 border border-white/10 rounded px-2 py-1.5 text-sm text-white w-full focus:outline-none focus:border-orange-500/60";
const numInp = inp + " text-center";

// ─── Step 1: Match Details ────────────────────────────────────────────────────

function Step1({ details, onChange }: { details: MatchDetails; onChange: (d: MatchDetails) => void }) {
  const set = (k: keyof MatchDetails, v: string | number) => onChange({ ...details, [k]: v });

  return (
    <div className="space-y-6">
      {/* Format */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-3">
        <h2 className="font-semibold text-white">Match Format</h2>
        <div className="flex gap-3">
          {(["TEST", "ODI", "T20"] as Format[]).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => set("format", f)}
              className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all ${
                details.format === f
                  ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30"
                  : "bg-white/5 text-gray-400 hover:bg-white/10"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Date + Label */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
        <h2 className="font-semibold text-white">Match Details</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Date *</label>
            <input type="date" value={details.date} onChange={(e) => set("date", e.target.value)} required className={inp} />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Label (optional)</label>
            <input type="text" value={details.label} onChange={(e) => set("label", e.target.value)} placeholder="e.g. Match 1" className={inp} />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Season (optional)</label>
            <input type="text" value={details.season} onChange={(e) => set("season", e.target.value)} placeholder="e.g. 2025, Season 1" className={inp} />
          </div>
        </div>
      </div>

      {/* Teams */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
        <h2 className="font-semibold text-white">Team Names</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Team 1</label>
            <input type="text" value={details.team1Name} onChange={(e) => set("team1Name", e.target.value)} placeholder="e.g. Maple XI" className={inp} />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Team 2</label>
            <input type="text" value={details.team2Name} onChange={(e) => set("team2Name", e.target.value)} placeholder="e.g. Oak XI" className={inp} />
          </div>
        </div>
      </div>

      {/* Toss */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-3">
        <h2 className="font-semibold text-white">Toss — Who bats first?</h2>
        <div className="flex gap-3">
          {([1, 2] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => onChange({ ...details, battingFirst: t })}
              className={`flex-1 py-3 rounded-lg font-semibold text-sm transition-all ${
                details.battingFirst === t
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                  : "bg-white/5 text-gray-400 hover:bg-white/10"
              }`}
            >
              {t === 1 ? details.team1Name || "Team 1" : details.team2Name || "Team 2"}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Step 2: Team Builder (Drag & Drop) ───────────────────────────────────────

function PlayerChip({ name, zone, onDragStart, onRemove }: { name: string; zone: "pool" | "team1" | "team2"; onDragStart: () => void; onRemove?: () => void }) {
  const color = zone === "team1" ? "border-blue-500/50 bg-blue-500/10 text-blue-200" : zone === "team2" ? "border-green-500/50 bg-green-500/10 text-green-200" : "border-white/20 bg-white/5 text-gray-300";
  return (
    <div
      draggable
      onDragStart={onDragStart}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm cursor-grab active:cursor-grabbing select-none ${color}`}
    >
      <span>{name}</span>
      {onRemove && (
        <button type="button" onClick={onRemove} className="text-xs opacity-50 hover:opacity-100 ml-1">✕</button>
      )}
    </div>
  );
}

function DropZone({ label, color, players, allPlayers, onDrop, onRemove, onDragStart }: {
  label: string; color: string; players: number[]; allPlayers: Player[];
  onDrop: () => void; onRemove: (id: number) => void; onDragStart: (id: number) => void;
}) {
  const [over, setOver] = useState(false);
  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={() => { setOver(false); onDrop(); }}
      className={`flex-1 min-h-[180px] rounded-xl border-2 border-dashed p-3 transition-colors ${over ? color + " border-opacity-100" : "border-white/10 bg-white/[0.02]"}`}
    >
      <p className="text-xs font-bold uppercase tracking-wider mb-3 text-gray-400">{label} <span className="text-gray-600">({players.length})</span></p>
      <div className="flex flex-wrap gap-2">
        {players.map((id) => {
          const p = allPlayers.find((x) => x.id === id);
          return p ? (
            <PlayerChip
              key={id}
              name={p.name}
              zone={label.toLowerCase().includes("team 1") ? "team1" : label.toLowerCase().includes("team 2") ? "team2" : "pool"}
              onDragStart={() => onDragStart(id)}
              onRemove={() => onRemove(id)}
            />
          ) : null;
        })}
      </div>
      {players.length === 0 && <p className="text-xs text-gray-600 mt-2">Drop players here</p>}
    </div>
  );
}

function Step2({ teams, setTeams, details, players }: { teams: Teams; setTeams: (t: Teams) => void; details: MatchDetails; players: Player[] }) {
  const dragging = useRef<{ id: number; from: keyof Teams } | null>(null);

  function startDrag(id: number, from: keyof Teams) { dragging.current = { id, from }; }

  function dropInto(to: keyof Teams) {
    if (!dragging.current) return;
    const { id, from } = dragging.current;
    if (from === to) return;
    setTeams({
      ...teams,
      [from]: teams[from].filter((x) => x !== id),
      [to]: [...teams[to], id],
    });
    dragging.current = null;
  }

  function removeFrom(id: number, from: keyof Teams) {
    setTeams({ ...teams, [from]: teams[from].filter((x) => x !== id), pool: from !== "pool" ? [...teams.pool, id] : teams.pool });
  }

  const allAssigned = teams.pool.length === 0;

  return (
    <div className="space-y-4">
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3 text-sm text-amber-200">
        Drag players from the pool into each team. Players not assigned will be excluded from scorecards.
      </div>

      {/* Pool */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Player Pool — Unassigned ({teams.pool.length})</p>
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => dropInto("pool")}
          className="flex flex-wrap gap-2 min-h-[48px]"
        >
          {teams.pool.map((id) => {
            const p = players.find((x) => x.id === id);
            return p ? <PlayerChip key={id} name={p.name} zone="pool" onDragStart={() => startDrag(id, "pool")} /> : null;
          })}
          {teams.pool.length === 0 && <p className="text-xs text-gray-600 self-center">All players assigned</p>}
        </div>
      </div>

      {/* Team zones */}
      <div className="flex gap-4">
        <DropZone
          label={`Team 1 — ${details.team1Name || "Team 1"}`}
          color="border-blue-500/40 bg-blue-500/5"
          players={teams.team1}
          allPlayers={players}
          onDrop={() => dropInto("team1")}
          onRemove={(id) => removeFrom(id, "team1")}
          onDragStart={(id) => startDrag(id, "team1")}
        />
        <DropZone
          label={`Team 2 — ${details.team2Name || "Team 2"}`}
          color="border-green-500/40 bg-green-500/5"
          players={teams.team2}
          allPlayers={players}
          onDrop={() => dropInto("team2")}
          onRemove={(id) => removeFrom(id, "team2")}
          onDragStart={(id) => startDrag(id, "team2")}
        />
      </div>

      {allAssigned && (teams.team1.length === 0 || teams.team2.length === 0) && (
        <p className="text-red-400 text-sm">Both teams need at least one player.</p>
      )}
    </div>
  );
}

// ─── Step 3: Scorecards ───────────────────────────────────────────────────────

type DismissalType = "" | "b" | "c" | "c&b" | "lbw" | "ro" | "st" | "hw" | "obs" | "hb" | "ret";

function parseDismissal(d: string): { type: DismissalType; name1: string; name2: string } {
  if (!d) return { type: "", name1: "", name2: "" };
  if (d === "obs") return { type: "obs", name1: "", name2: "" };
  if (d === "hb") return { type: "hb", name1: "", name2: "" };
  if (d === "ret out" || d === "ret") return { type: "ret", name1: "", name2: "" };
  if (d.startsWith("c&b")) return { type: "c&b", name1: d.slice(3).trim(), name2: "" };
  const cFull = d.match(/^c (.+) b (.+)$/);
  if (cFull) return { type: "c", name1: cFull[1], name2: cFull[2] };
  if (d.startsWith("c ") || d === "c") return { type: "c", name1: d.slice(1).trim(), name2: "" };
  const stFull = d.match(/^st (.+) b (.+)$/);
  if (stFull) return { type: "st", name1: stFull[1], name2: stFull[2] };
  if (d.startsWith("st")) return { type: "st", name1: d.slice(2).trim(), name2: "" };
  if (d.startsWith("lbw")) return { type: "lbw", name1: d.slice(3).trim(), name2: "" };
  if (d.startsWith("hw")) return { type: "hw", name1: d.slice(2).trim(), name2: "" };
  if (d.startsWith("ro")) return { type: "ro", name1: d.slice(2).trim(), name2: "" };
  if (d.startsWith("b")) return { type: "b", name1: d.slice(1).trim(), name2: "" };
  return { type: "", name1: "", name2: "" };
}

// Always write the type prefix so parseDismissal can recover type even with empty names
function composeDismissal(type: DismissalType, name1: string, name2: string): string {
  if (!type) return "";
  if (type === "obs") return "obs";
  if (type === "hb") return "hb";
  if (type === "ret") return "ret out";
  if (type === "b") return name1 ? `b ${name1}` : "b";
  if (type === "c&b") return name1 ? `c&b ${name1}` : "c&b";
  if (type === "lbw") return name1 ? `lbw ${name1}` : "lbw";
  if (type === "hw") return name1 ? `hw ${name1}` : "hw";
  if (type === "ro") return name1 ? `ro ${name1}` : "ro";
  if (type === "c") return name1 && name2 ? `c ${name1} b ${name2}` : name1 ? `c ${name1}` : "c";
  if (type === "st") return name1 && name2 ? `st ${name1} b ${name2}` : name1 ? `st ${name1}` : "st";
  return "";
}

const BOWLER_TYPES: DismissalType[] = ["b", "c&b", "lbw", "hw"];
const BOWLER_FIELDER_TYPES: DismissalType[] = ["c", "st"];
const FIELDER_ONLY_TYPES: DismissalType[] = ["ro"];
const NO_NAME_TYPES: DismissalType[] = ["obs", "hb", "ret"];

function BowlerSelect({ value, players, onChange }: { value: string; players: Player[]; onChange: (v: string) => void }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}
      className="bg-white/5 border border-white/10 rounded px-1.5 py-1 text-xs text-gray-300 focus:outline-none focus:border-orange-500/50">
      <option value="">— bowler —</option>
      {players.map((p) => <option key={p.id} value={p.name}>{p.name}</option>)}
    </select>
  );
}

function NameInput({ value, placeholder, onChange }: { value: string; placeholder: string; onChange: (v: string) => void }) {
  return (
    <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
      className="bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-gray-300 focus:outline-none focus:border-orange-500/50 w-28" />
  );
}

function BattingTable({ rows, players, bowlingTeamPlayers, onChange }: {
  rows: BattingEntry[];
  players: Player[];
  bowlingTeamPlayers: Player[];
  onChange: (rows: BattingEntry[]) => void;
}) {
  function upd(idx: number, field: keyof BattingEntry, val: number | boolean | string) {
    onChange(rows.map((r, i) => i === idx ? { ...r, [field]: val } : r));
  }

  function setType(idx: number, type: DismissalType, cur: { name1: string; name2: string }) {
    upd(idx, "dismissal", composeDismissal(type, cur.name1, cur.name2));
  }

  function setName1(idx: number, type: DismissalType, name1: string, name2: string) {
    upd(idx, "dismissal", composeDismissal(type, name1, name2));
  }

  function setName2(idx: number, type: DismissalType, name1: string, name2: string) {
    upd(idx, "dismissal", composeDismissal(type, name1, name2));
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-gray-500 text-xs">
            <th className="text-left pb-2 pr-3">Batsman</th>
            <th className="text-center pb-2 px-1">R</th>
            <th className="text-center pb-2 px-1">B</th>
            <th className="text-center pb-2 px-1">4s</th>
            <th className="text-center pb-2 px-1">6s</th>
            <th className="text-center pb-2 px-1">NO</th>
            <th className="text-center pb-2 px-1">DNB</th>
            <th className="text-left pb-2 pl-3 text-gray-500">Dismissal</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => {
            const p = players.find((x) => x.id === row.playerId);
            const disabled = row.dnb || row.notOut;
            const { type, name1, name2 } = parseDismissal(row.dismissal);
            return (
              <tr key={row.playerId} className={row.dnb ? "opacity-40" : ""}>
                <td className="pr-3 py-1 text-white font-medium whitespace-nowrap">{p?.name}</td>
                <td className="px-1 py-1"><input disabled={row.dnb} type="number" min="0" value={row.runs} onChange={(e) => upd(idx, "runs", Number(e.target.value))} className={numInp + " w-14"} /></td>
                <td className="px-1 py-1"><input disabled={row.dnb} type="number" min="0" value={row.balls} onChange={(e) => upd(idx, "balls", Number(e.target.value))} className={numInp + " w-14"} /></td>
                <td className="px-1 py-1"><input disabled={row.dnb} type="number" min="0" value={row.fours} onChange={(e) => upd(idx, "fours", Number(e.target.value))} className={numInp + " w-14"} /></td>
                <td className="px-1 py-1"><input disabled={row.dnb} type="number" min="0" value={row.sixes} onChange={(e) => upd(idx, "sixes", Number(e.target.value))} className={numInp + " w-14"} /></td>
                <td className="px-1 py-1 text-center">
                  <input
                    disabled={row.dnb}
                    type="checkbox"
                    checked={row.notOut}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      onChange(rows.map((r, i) => i === idx ? { ...r, notOut: checked, ...(checked ? { dismissal: "" } : {}) } : r));
                    }}
                    className="accent-orange-500 w-4 h-4"
                  />
                </td>
                <td className="px-1 py-1 text-center">
                  <input
                    type="checkbox"
                    checked={row.dnb}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      onChange(rows.map((r, i) => i === idx ? { ...r, dnb: checked, ...(checked ? { runs: 0, balls: 0, dismissal: "" } : {}) } : r));
                    }}
                    className="accent-gray-500 w-4 h-4"
                  />
                </td>
                <td className="pl-3 py-1">
                  {disabled ? (
                    <span className="text-xs text-gray-600 italic">{row.notOut ? "not out" : "—"}</span>
                  ) : (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <select
                        value={type}
                        onChange={(e) => setType(idx, e.target.value as DismissalType, { name1: "", name2: "" })}
                        className="bg-white/5 border border-white/10 rounded px-1.5 py-1 text-xs text-gray-300 focus:outline-none focus:border-orange-500/50"
                      >
                        <option value="">—</option>
                        <option value="b">Bowled</option>
                        <option value="c">Caught</option>
                        <option value="c&b">Caught &amp; Bowled</option>
                        <option value="lbw">LBW</option>
                        <option value="ro">Run Out</option>
                        <option value="st">Stumped</option>
                        <option value="hw">Hit Wicket</option>
                        <option value="obs">Obstructing</option>
                        <option value="hb">Handled Ball</option>
                        <option value="ret">Retired Out</option>
                      </select>

                      {/* Bowled / LBW / Hit Wicket / C&B: just bowler */}
                      {BOWLER_TYPES.includes(type) && (
                        <BowlerSelect value={name1} players={bowlingTeamPlayers}
                          onChange={(v) => setName1(idx, type, v, name2)} />
                      )}

                      {/* Caught: fielder text + bowler dropdown */}
                      {type === "c" && (
                        <>
                          <NameInput value={name1} placeholder="fielder" onChange={(v) => setName1(idx, "c", v, name2)} />
                          <span className="text-xs text-gray-600">b</span>
                          <BowlerSelect value={name2} players={bowlingTeamPlayers}
                            onChange={(v) => setName2(idx, "c", name1, v)} />
                        </>
                      )}

                      {/* Stumped: keeper text + bowler dropdown */}
                      {type === "st" && (
                        <>
                          <NameInput value={name1} placeholder="keeper" onChange={(v) => setName1(idx, "st", v, name2)} />
                          <span className="text-xs text-gray-600">b</span>
                          <BowlerSelect value={name2} players={bowlingTeamPlayers}
                            onChange={(v) => setName2(idx, "st", name1, v)} />
                        </>
                      )}

                      {/* Run Out: just fielder */}
                      {FIELDER_ONLY_TYPES.includes(type) && (
                        <NameInput value={name1} placeholder="fielder" onChange={(v) => setName1(idx, type, v, name2)} />
                      )}
                      {/* obs / hb / ret: no extra fields */}
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function BowlingTable({ rows, players, onChange }: {
  rows: BowlingEntry[];
  players: Player[];
  onChange: (rows: BowlingEntry[]) => void;
}) {
  function upd(idx: number, field: keyof BowlingEntry, val: number) {
    onChange(rows.map((r, i) => i === idx ? { ...r, [field]: val } : r));
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-gray-500 text-xs">
            <th className="text-left pb-2 pr-3">Bowler</th>
            <th className="text-center pb-2 px-1">W</th>
            <th className="text-center pb-2 px-1">Ov</th>
            <th className="text-center pb-2 px-1">R</th>
            <th className="text-center pb-2 px-1">Mdn</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => {
            const p = players.find((x) => x.id === row.playerId);
            return (
              <tr key={row.playerId}>
                <td className="pr-3 py-1 text-white font-medium whitespace-nowrap">{p?.name}</td>
                <td className="px-1 py-1"><input type="number" min="0" value={row.wickets} onChange={(e) => upd(idx, "wickets", Number(e.target.value))} className={numInp + " w-14"} /></td>
                <td className="px-1 py-1"><input type="number" min="0" step="0.1" value={row.overs} onChange={(e) => upd(idx, "overs", Number(e.target.value))} className={numInp + " w-16"} /></td>
                <td className="px-1 py-1"><input type="number" min="0" value={row.runsConceded} onChange={(e) => upd(idx, "runsConceded", Number(e.target.value))} className={numInp + " w-14"} /></td>
                <td className="px-1 py-1"><input type="number" min="0" value={row.maidens} onChange={(e) => upd(idx, "maidens", Number(e.target.value))} className={numInp + " w-14"} /></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Step3({ innings, setInnings, details, teams, players }: {
  innings: InningsData[];
  setInnings: (inn: InningsData[]) => void;
  details: MatchDetails;
  teams: Teams;
  players: Player[];
}) {
  const [activeTab, setActiveTab] = useState(0);

  function updateInnings(idx: number, updated: InningsData) {
    setInnings(innings.map((inn, i) => i === idx ? updated : inn));
  }

  function addInnings() {
    if (innings.length >= 4) return;
    setInnings(addTestInnings(innings, details, teams));
    setActiveTab(innings.length);
  }

  function removeInnings(idx: number) {
    const next = innings.filter((_, i) => i !== idx).map((inn, i) => ({ ...inn, inningsNum: i + 1, battingTeam: battingTeamForInnings(i + 1, details.battingFirst) }));
    setInnings(next);
    setActiveTab(Math.max(0, idx - 1));
  }

  const teamName = (t: 1 | 2) => t === 1 ? (details.team1Name || "Team 1") : (details.team2Name || "Team 2");

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {innings.map((inn, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setActiveTab(idx)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === idx ? "bg-orange-500 text-white" : "bg-white/5 text-gray-400 hover:bg-white/10"}`}
          >
            Innings {inn.inningsNum}
            <span className="ml-1.5 text-xs opacity-70">{teamName(inn.battingTeam)} bat</span>
          </button>
        ))}
        {details.format === "TEST" && innings.length < 4 && (
          <button type="button" onClick={addInnings} className="px-3 py-2 rounded-lg text-sm text-gray-400 border border-dashed border-white/20 hover:border-white/40 transition-colors">
            + Add Innings {innings.length + 1}
          </button>
        )}
      </div>

      {/* Active innings */}
      {innings.map((inn, idx) => {
        if (idx !== activeTab) return null;
        const bowlingTeam: 1 | 2 = inn.battingTeam === 1 ? 2 : 1;
        return (
          <div key={idx} className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-400">
                <span className="text-orange-400 font-semibold">{teamName(inn.battingTeam)}</span> batting vs <span className="text-purple-400 font-semibold">{teamName(bowlingTeam)}</span> bowling
              </div>
              {details.format === "TEST" && innings.length > 2 && (
                <button type="button" onClick={() => removeInnings(idx)} className="text-xs text-red-400 hover:text-red-300">Remove innings</button>
              )}
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-orange-400 mb-3">🏏 {teamName(inn.battingTeam)} — Batting</p>
              <BattingTable
                rows={inn.batting}
                players={players}
                bowlingTeamPlayers={players.filter((pl) => inn.bowling.some((b) => b.playerId === pl.id))}
                onChange={(rows) => updateInnings(idx, { ...inn, batting: rows })}
              />
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-purple-400 mb-3">🎯 {teamName(bowlingTeam)} — Bowling</p>
              <BowlingTable
                rows={inn.bowling}
                players={players}
                onChange={(rows) => updateInnings(idx, { ...inn, bowling: rows })}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── POTM Picker ──────────────────────────────────────────────────────────────

function PotmPicker({ players, matchPlayers, potmId, onChange }: {
  players: Player[];
  matchPlayers: number[];
  potmId: number | null;
  onChange: (id: number | null) => void;
}) {
  const eligible = players.filter((p) => matchPlayers.includes(p.id));
  return (
    <div className="mt-6 bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">⭐</span>
        <h3 className="font-bold text-white" style={{ fontFamily: "var(--font-rajdhani)" }}>Player of the Match</h3>
        <span className="text-xs text-gray-600 ml-1">(optional)</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {eligible.map((p) => {
          const selected = potmId === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onChange(selected ? null : p.id)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
                selected
                  ? "bg-yellow-500 border-yellow-400 text-black shadow-[0_0_16px_rgba(234,179,8,0.4)]"
                  : "bg-white/5 border-white/10 text-gray-300 hover:border-yellow-500/40 hover:text-yellow-200"
              }`}
            >
              {selected && "⭐ "}{p.name}
            </button>
          );
        })}
        {potmId && (
          <button type="button" onClick={() => onChange(null)}
            className="px-3 py-2 rounded-xl text-xs text-gray-600 hover:text-gray-400 border border-dashed border-white/10 transition-colors">
            Clear
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Step Indicator ───────────────────────────────────────────────────────────

function StepBar({ step }: { step: number }) {
  const steps = ["Match Info", "Build Teams", "Scorecards"];
  return (
    <div className="flex items-center gap-0 mb-8">
      {steps.map((s, i) => (
        <div key={i} className="flex items-center flex-1 last:flex-none">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${i + 1 <= step ? "bg-orange-500 text-white" : "bg-white/10 text-gray-500"}`}>
            {i + 1 <= step - 1 ? "✓" : i + 1}
          </div>
          <span className={`ml-2 text-sm font-medium ${i + 1 === step ? "text-white" : "text-gray-500"}`}>{s}</span>
          {i < steps.length - 1 && <div className={`flex-1 h-px mx-3 ${i + 1 < step ? "bg-orange-500/60" : "bg-white/10"}`} />}
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function MatchForm({ players, matchId, initial, redirectTo = "/matches" }: Props) {
  const router = useRouter();
  const today = new Date().toISOString().split("T")[0];

  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [details, setDetails] = useState<MatchDetails>(
    initial?.details ?? { format: "ODI", date: today, label: "", season: "", team1Name: "", team2Name: "", battingFirst: 1 }
  );

  const [teams, setTeams] = useState<Teams>(() => {
    if (initial?.members?.length) {
      const t1 = initial.members.filter((m) => m.team === 1).map((m) => m.playerId);
      const t2 = initial.members.filter((m) => m.team === 2).map((m) => m.playerId);
      const assigned = new Set([...t1, ...t2]);
      return { team1: t1, team2: t2, pool: players.filter((p) => !assigned.has(p.id)).map((p) => p.id) };
    }
    return { team1: [], team2: [], pool: players.map((p) => p.id) };
  });

  const [innings, setInnings] = useState<InningsData[]>(initial?.innings ?? []);
  const [potmId, setPotmId] = useState<number | null>(initial?.potmId ?? null);

  function goToStep3() {
    if (teams.team1.length === 0 || teams.team2.length === 0) return;
    if (innings.length === 0) {
      setInnings(buildInnings(teams, details));
    }
    setStep(3);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const members = [
        ...teams.team1.map((id) => ({ playerId: id, team: 1 })),
        ...teams.team2.map((id) => ({ playerId: id, team: 2 })),
      ];
      const batting = innings.flatMap((inn) =>
        inn.batting.map((b) => ({ ...b, innings: inn.inningsNum, team: inn.battingTeam }))
      );
      const bowling = innings.flatMap((inn) => {
        const bowlingTeam: 1 | 2 = inn.battingTeam === 1 ? 2 : 1;
        return inn.bowling.map((b) => ({ ...b, innings: inn.inningsNum, team: bowlingTeam }));
      });

      const res = await fetch(matchId ? `/api/matches/${matchId}` : "/api/matches", {
        method: matchId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...details, potmId, members, batting, bowling }),
      });
      if (!res.ok) {
        let msg = "Failed to save";
        try { msg = (await res.json()).error ?? msg; } catch { /* empty body */ }
        throw new Error(msg);
      }
      router.push(redirectTo);
      router.refresh();
    } catch (err) {
      setError(String(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <StepBar step={step} />

      {step === 1 && <Step1 details={details} onChange={setDetails} />}
      {step === 2 && <Step2 teams={teams} setTeams={setTeams} details={details} players={players} />}
      {step === 3 && (
        <>
          <Step3 innings={innings} setInnings={setInnings} details={details} teams={teams} players={players} />
          <PotmPicker
            players={players}
            matchPlayers={[...teams.team1, ...teams.team2]}
            potmId={potmId}
            onChange={setPotmId}
          />
        </>
      )}

      {error && <p className="text-red-400 text-sm mt-4">{error}</p>}

      <div className="flex gap-3 mt-6">
        {step > 1 && (
          <button type="button" onClick={() => setStep(step - 1)} className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors">
            ← Back
          </button>
        )}
        {step < 3 && (
          <button
            type="button"
            onClick={() => step === 2 ? goToStep3() : setStep(2)}
            disabled={step === 2 && (teams.team1.length === 0 || teams.team2.length === 0)}
            className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white font-semibold rounded-lg transition-colors"
          >
            Next →
          </button>
        )}
        {step === 3 && (
          <button type="submit" disabled={saving} className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors">
            {saving ? "Saving…" : matchId ? "Update Match" : "Save Match"}
          </button>
        )}
        <button type="button" onClick={() => router.back()} className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors">
          Cancel
        </button>
      </div>
    </form>
  );
}
