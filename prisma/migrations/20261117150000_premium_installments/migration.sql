-- AlterEnum
ALTER TYPE "OrderStatus" ADD VALUE 'DEPOSIT_PAID';
ALTER TYPE "OrderStatus" ADD VALUE 'BALANCE_UNPAID';

-- AlterTable
ALTER TABLE "order" ADD COLUMN     "balanceDueAt" TIMESTAMP(3),
ADD COLUMN     "depositChargedMnt" INTEGER,
ADD COLUMN     "depositInvoiceId" TEXT,
ADD COLUMN     "depositMnt" INTEGER,
ADD COLUMN     "depositPaidAt" TIMESTAMP(3),
ADD COLUMN     "depositPaymentId" TEXT;
