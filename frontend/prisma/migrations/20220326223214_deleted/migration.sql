-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ConfiguredConnection" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "roleId" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "merkleRoot" TEXT NOT NULL,
    "prettyName" TEXT NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "ConfiguredConnection_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild" ("guildId") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ConfiguredConnection_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role" ("roleId") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ConfiguredConnection" ("createdAt", "guildId", "id", "merkleRoot", "prettyName", "roleId") SELECT "createdAt", "guildId", "id", "merkleRoot", "prettyName", "roleId" FROM "ConfiguredConnection";
DROP TABLE "ConfiguredConnection";
ALTER TABLE "new_ConfiguredConnection" RENAME TO "ConfiguredConnection";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
