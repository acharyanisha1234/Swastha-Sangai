-- CreateEnum
CREATE TYPE "DonationApplicationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "DonationApplication" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "donationPostId" INTEGER NOT NULL,
    "status" "DonationApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DonationApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DonationPost" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image" TEXT,
    "creatorId" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DonationPost_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DonationApplication_userId_donationPostId_key" ON "DonationApplication"("userId", "donationPostId");

-- AddForeignKey
ALTER TABLE "DonationApplication" ADD CONSTRAINT "DonationApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DonationApplication" ADD CONSTRAINT "DonationApplication_donationPostId_fkey" FOREIGN KEY ("donationPostId") REFERENCES "DonationPost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DonationPost" ADD CONSTRAINT "DonationPost_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
