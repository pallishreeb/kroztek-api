-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AuditAction" ADD VALUE 'TASK_COMMENT_UPDATED';
ALTER TYPE "AuditAction" ADD VALUE 'TASK_COMMENT_DELETED';

-- AlterEnum
ALTER TYPE "TaskStatus" ADD VALUE 'CLOSED';

-- CreateTable
CREATE TABLE "UserSession" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "loginAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3),
    "logoutAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserSession_companyId_loginAt_idx" ON "UserSession"("companyId", "loginAt");

-- CreateIndex
CREATE INDEX "UserSession_userId_loginAt_idx" ON "UserSession"("userId", "loginAt");

-- CreateIndex
CREATE INDEX "UserSession_userId_logoutAt_idx" ON "UserSession"("userId", "logoutAt");

-- AddForeignKey
ALTER TABLE "UserSession" ADD CONSTRAINT "UserSession_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSession" ADD CONSTRAINT "UserSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
