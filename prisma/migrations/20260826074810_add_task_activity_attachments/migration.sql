/*
  Warnings:

  - You are about to drop the column `photoUrl` on the `TaskActivity` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "TaskActivity" DROP COLUMN "photoUrl";

-- CreateTable
CREATE TABLE "TaskActivityAttachment" (
    "id" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileType" TEXT,
    "fileSize" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaskActivityAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TaskActivityAttachment_activityId_idx" ON "TaskActivityAttachment"("activityId");

-- AddForeignKey
ALTER TABLE "TaskActivityAttachment" ADD CONSTRAINT "TaskActivityAttachment_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "TaskActivity"("id") ON DELETE CASCADE ON UPDATE CASCADE;
