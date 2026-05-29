-- AlterTable
ALTER TABLE "workout_logs" ADD COLUMN     "verificationType" TEXT,
ADD COLUMN     "verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "verifiedAt" TIMESTAMP(3),
ADD COLUMN     "workoutDuration" INTEGER,
ADD COLUMN     "workoutType" TEXT;
