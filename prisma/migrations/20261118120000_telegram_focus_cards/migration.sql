-- CreateEnum
CREATE TYPE "SignalKind" AS ENUM ('COPY', 'FOCUS', 'TRADE');

-- CreateEnum
CREATE TYPE "TradeSide" AS ENUM ('BUY', 'SELL');

-- AlterTable
ALTER TABLE "signal" ADD COLUMN     "cardId" TEXT,
ADD COLUMN     "kind" "SignalKind" NOT NULL DEFAULT 'COPY',
ADD COLUMN     "pressId" TEXT,
ADD COLUMN     "side" "TradeSide",
ADD COLUMN     "text" TEXT,
ALTER COLUMN "sourceMessageId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "focus_card" (
    "id" TEXT NOT NULL,
    "pair" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    "messageId" INTEGER,
    "focusSignalId" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "lastSide" "TradeSide",
    "lastPressedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "focus_card_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "focus_card_chatId_active_idx" ON "focus_card"("chatId", "active");

-- CreateIndex
CREATE UNIQUE INDEX "signal_pressId_key" ON "signal"("pressId");

-- CreateIndex
CREATE INDEX "signal_cardId_idx" ON "signal"("cardId");

-- AddForeignKey
ALTER TABLE "signal" ADD CONSTRAINT "signal_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "focus_card"("id") ON DELETE SET NULL ON UPDATE CASCADE;

