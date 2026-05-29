-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isAccountVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "resetOtp" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "resetOtpExpireAt" TIMESTAMP(3),
ADD COLUMN     "verifyOtp" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "verifyOtpExpireAt" TIMESTAMP(3);
