-- CreateTable
CREATE TABLE "MatchTeamMember" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "matchId" INTEGER NOT NULL,
    "playerId" INTEGER NOT NULL,
    "team" INTEGER NOT NULL,
    CONSTRAINT "MatchTeamMember_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MatchTeamMember_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_BattingStat" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "playerId" INTEGER NOT NULL,
    "matchId" INTEGER NOT NULL,
    "innings" INTEGER NOT NULL DEFAULT 1,
    "team" INTEGER NOT NULL DEFAULT 1,
    "runs" INTEGER NOT NULL,
    "balls" INTEGER NOT NULL,
    "fours" INTEGER NOT NULL,
    "sixes" INTEGER NOT NULL,
    "notOut" BOOLEAN NOT NULL DEFAULT false,
    "dnb" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "BattingStat_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BattingStat_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_BattingStat" ("balls", "fours", "id", "matchId", "notOut", "playerId", "runs", "sixes") SELECT "balls", "fours", "id", "matchId", "notOut", "playerId", "runs", "sixes" FROM "BattingStat";
DROP TABLE "BattingStat";
ALTER TABLE "new_BattingStat" RENAME TO "BattingStat";
CREATE TABLE "new_BowlingStat" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "playerId" INTEGER NOT NULL,
    "matchId" INTEGER NOT NULL,
    "innings" INTEGER NOT NULL DEFAULT 1,
    "team" INTEGER NOT NULL DEFAULT 1,
    "wickets" INTEGER NOT NULL,
    "overs" REAL NOT NULL,
    "runsConceded" INTEGER NOT NULL,
    "maidens" INTEGER NOT NULL,
    CONSTRAINT "BowlingStat_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BowlingStat_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_BowlingStat" ("id", "maidens", "matchId", "overs", "playerId", "runsConceded", "wickets") SELECT "id", "maidens", "matchId", "overs", "playerId", "runsConceded", "wickets" FROM "BowlingStat";
DROP TABLE "BowlingStat";
ALTER TABLE "new_BowlingStat" RENAME TO "BowlingStat";
CREATE TABLE "new_Match" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" DATETIME NOT NULL,
    "label" TEXT,
    "format" TEXT NOT NULL DEFAULT 'ODI',
    "team1Name" TEXT NOT NULL DEFAULT 'Team 1',
    "team2Name" TEXT NOT NULL DEFAULT 'Team 2',
    "battingFirst" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Match" ("createdAt", "date", "id", "label") SELECT "createdAt", "date", "id", "label" FROM "Match";
DROP TABLE "Match";
ALTER TABLE "new_Match" RENAME TO "Match";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
