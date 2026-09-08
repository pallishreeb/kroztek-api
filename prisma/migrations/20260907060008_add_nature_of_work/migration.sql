-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "department" TEXT,
ADD COLUMN     "designation" TEXT;

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "natureOfWorkId" TEXT,
ALTER COLUMN "type" DROP NOT NULL,
ALTER COLUMN "title" DROP NOT NULL;

-- CreateTable
CREATE TABLE "NatureOfWork" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NatureOfWork_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "NatureOfWork_companyId_role_idx" ON "NatureOfWork"("companyId", "role");

-- CreateIndex
CREATE INDEX "NatureOfWork_companyId_isActive_idx" ON "NatureOfWork"("companyId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "NatureOfWork_companyId_role_name_key" ON "NatureOfWork"("companyId", "role", "name");

-- CreateIndex
CREATE INDEX "Task_natureOfWorkId_idx" ON "Task"("natureOfWorkId");

-- AddForeignKey
ALTER TABLE "NatureOfWork" ADD CONSTRAINT "NatureOfWork_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_natureOfWorkId_fkey" FOREIGN KEY ("natureOfWorkId") REFERENCES "NatureOfWork"("id") ON DELETE SET NULL ON UPDATE CASCADE;
