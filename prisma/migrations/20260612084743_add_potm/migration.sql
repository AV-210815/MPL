-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Match" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "apartmentId" INTEGER NOT NULL DEFAULT 1,
    "date" DATETIME NOT NULL,
    "label" TEXT,
    "format" TEXT NOT NULL DEFAULT 'ODI',
    "team1Name" TEXT NOT NULL DEFAULT 'Team 1',
    "team2Name" TEXT NOT NULL DEFAULT 'Team 2',
    "battingFirst" INTEGER NOT NULL DEFAULT 1,
    "result" TEXT,
    "potmId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Match_apartmentId_fkey" FOREIGN KEY ("apartmentId") REFERENCES "Apartment" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Match_potmId_fkey" FOREIGN KEY ("potmId") REFERENCES "Player" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Match" ("apartmentId", "battingFirst", "createdAt", "date", "format", "id", "label", "result", "team1Name", "team2Name") SELECT "apartmentId", "battingFirst", "createdAt", "date", "format", "id", "label", "result", "team1Name", "team2Name" FROM "Match";
DROP TABLE "Match";
ALTER TABLE "new_Match" RENAME TO "Match";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
