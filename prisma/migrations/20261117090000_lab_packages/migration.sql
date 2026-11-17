-- CreateEnum
CREATE TYPE "LabPackage" AS ENUM ('PRO', 'PREMIUM');

-- AlterTable
ALTER TABLE "order" ADD COLUMN     "labPackage" "LabPackage",
ADD COLUMN     "teacher" TEXT,
ADD COLUMN     "withPsychologist" BOOLEAN NOT NULL DEFAULT false;

