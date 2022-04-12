/*
  Warnings:

  - Added the required column `configuredConnectionId` to the `Proof` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nullifier` to the `Proof` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Proof" ADD COLUMN     "configuredConnectionId" INTEGER NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "nullifier" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Proof" ADD CONSTRAINT "Proof_configuredConnectionId_fkey" FOREIGN KEY ("configuredConnectionId") REFERENCES "ConfiguredConnection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
