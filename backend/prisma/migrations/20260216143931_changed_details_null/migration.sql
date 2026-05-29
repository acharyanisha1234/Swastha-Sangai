-- DropForeignKey
ALTER TABLE "DonationApplication" DROP CONSTRAINT "DonationApplication_donationPostId_fkey";

-- AlterTable
ALTER TABLE "DonationApplication" ALTER COLUMN "donationPostId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "DonationApplication" ADD CONSTRAINT "DonationApplication_donationPostId_fkey" FOREIGN KEY ("donationPostId") REFERENCES "DonationPost"("id") ON DELETE SET NULL ON UPDATE CASCADE;
