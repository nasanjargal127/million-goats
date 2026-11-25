-- AlterTable
ALTER TABLE "order" ADD COLUMN     "installmentCount" INTEGER,
ADD COLUMN     "partsPaid" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "partPayments" JSONB;

-- Existing installment orders were all paid in two parts.
UPDATE "order" SET "installmentCount" = 2 WHERE "depositMnt" IS NOT NULL;
UPDATE "order" SET "partsPaid" = 1 WHERE "depositMnt" IS NOT NULL AND "depositPaidAt" IS NOT NULL;
