/*
  Warnings:

  - The `resetOtpExpireAt` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `verifyOtpExpireAt` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "resetOtpExpireAt",
ADD COLUMN     "resetOtpExpireAt" BIGINT NOT NULL DEFAULT 0,
DROP COLUMN "verifyOtpExpireAt",
ADD COLUMN     "verifyOtpExpireAt" BIGINT NOT NULL DEFAULT 0;
