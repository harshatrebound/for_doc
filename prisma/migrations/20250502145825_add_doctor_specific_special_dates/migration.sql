/*
  Warnings:

  - You are about to drop the column `breakEnd` on the `SpecialDate` table. All the data in the column will be lost.
  - You are about to drop the column `breakStart` on the `SpecialDate` table. All the data in the column will be lost.
  - Added the required column `name` to the `SpecialDate` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "SpecialDate" DROP CONSTRAINT "SpecialDate_doctorId_fkey";

-- DropIndex
DROP INDEX "SpecialDate_doctorId_date_idx";

-- AlterTable
ALTER TABLE "SpecialDate" DROP COLUMN "breakEnd",
DROP COLUMN "breakStart",
ADD COLUMN     "name" TEXT NOT NULL,
ALTER COLUMN "doctorId" DROP NOT NULL,
ALTER COLUMN "date" SET DATA TYPE DATE;

-- AddForeignKey
ALTER TABLE "SpecialDate" ADD CONSTRAINT "SpecialDate_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
