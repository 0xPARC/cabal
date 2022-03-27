/*
  Warnings:

  - The primary key for the `AuthToken` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `authToken` on the `AuthToken` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `AuthToken` table. All the data in the column will be lost.
  - You are about to drop the column `authTokenId` on the `Proof` table. All the data in the column will be lost.
  - The required column `authTokenString` was added to the `AuthToken` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `authTokenString` to the `Proof` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AuthToken" (
    "authTokenString" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "configuredConnectionId" INTEGER NOT NULL,
    CONSTRAINT "AuthToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("userId") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "AuthToken_configuredConnectionId_fkey" FOREIGN KEY ("configuredConnectionId") REFERENCES "ConfiguredConnection" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_AuthToken" ("configuredConnectionId", "createdAt", "userId") SELECT "configuredConnectionId", "createdAt", "userId" FROM "AuthToken";
DROP TABLE "AuthToken";
ALTER TABLE "new_AuthToken" RENAME TO "AuthToken";
CREATE TABLE "new_Proof" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "status" TEXT NOT NULL,
    "proof" TEXT NOT NULL,
    "authTokenString" TEXT NOT NULL,
    CONSTRAINT "Proof_authTokenString_fkey" FOREIGN KEY ("authTokenString") REFERENCES "AuthToken" ("authTokenString") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Proof" ("id", "proof", "status") SELECT "id", "proof", "status" FROM "Proof";
DROP TABLE "Proof";
ALTER TABLE "new_Proof" RENAME TO "Proof";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
