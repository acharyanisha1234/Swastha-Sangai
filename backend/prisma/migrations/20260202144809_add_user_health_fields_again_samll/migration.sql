/*
  Warnings:

  - You are about to drop the column `Goal` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `Height` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "Goal",
DROP COLUMN "Height",
ADD COLUMN     "goal" TEXT,
ADD COLUMN     "height" TEXT;
