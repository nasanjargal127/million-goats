-- CreateEnum
CREATE TYPE "SignalStatus" AS ENUM ('DRAFT', 'SENDING', 'SENT', 'FAILED', 'CANCELLED');

-- CreateTable
CREATE TABLE "signal" (
    "id" TEXT NOT NULL,
    "status" "SignalStatus" NOT NULL DEFAULT 'DRAFT',
    "sourceChatId" TEXT NOT NULL,
    "sourceMessageId" INTEGER NOT NULL,
    "promptMessageId" INTEGER,
    "adminName" TEXT,
    "preview" TEXT,
    "channelMessageId" INTEGER,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "signal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "signal_sourceChatId_sourceMessageId_key" ON "signal"("sourceChatId", "sourceMessageId");

