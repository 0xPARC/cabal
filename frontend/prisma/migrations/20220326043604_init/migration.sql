-- CreateTable
CREATE TABLE "Guild" (
    "guildId" TEXT NOT NULL PRIMARY KEY,
    "guildName" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Role" (
    "roleId" TEXT NOT NULL PRIMARY KEY,
    "roleName" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "User" (
    "userId" TEXT NOT NULL PRIMARY KEY,
    "userName" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "ConfiguredConnection" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "roleId" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "merkleRoot" TEXT NOT NULL,
    "prettyName" TEXT NOT NULL,
    CONSTRAINT "ConfiguredConnection_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild" ("guildId") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ConfiguredConnection_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role" ("roleId") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AuthToken" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "authToken" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "configuredConnectionId" INTEGER NOT NULL,
    CONSTRAINT "AuthToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("userId") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "AuthToken_configuredConnectionId_fkey" FOREIGN KEY ("configuredConnectionId") REFERENCES "ConfiguredConnection" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Proof" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "status" TEXT NOT NULL,
    "proof" TEXT NOT NULL,
    "authTokenId" INTEGER NOT NULL,
    CONSTRAINT "Proof_authTokenId_fkey" FOREIGN KEY ("authTokenId") REFERENCES "AuthToken" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
