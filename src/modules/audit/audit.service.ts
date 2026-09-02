import { prisma } from "../../core/database/prisma";
import { AuditAction } from "@prisma/client";

interface CreateAuditLogParams {
  companyId: string;
  userId?: string;
  action: AuditAction;
  entityType: string;
  entityId?: string;
  description: string;
}

export const createAuditLog = async ({
  companyId,
  userId,
  action,
  entityType,
  entityId,
  description,
}: CreateAuditLogParams) => {
  return prisma.auditLog.create({
    data: {
      companyId,
      userId,
      action,
      entityType,
      entityId,
      description,
    },
  });
};

export const getRecentAuditLogs = async (
  companyId: string,
  limit?: number
) => {
  return prisma.auditLog.findMany({
    where: {
      companyId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          role: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    ...(limit
      ? {
          take: Math.min(limit, 50),
        }
      : {}),
  });
};