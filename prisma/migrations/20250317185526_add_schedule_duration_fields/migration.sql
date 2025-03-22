-- AlterTable
ALTER TABLE "DoctorSchedule" ADD COLUMN     "breakEnd" TEXT,
ADD COLUMN     "breakStart" TEXT,
ADD COLUMN     "bufferTime" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "slotDuration" INTEGER NOT NULL DEFAULT 15;
