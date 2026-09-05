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

export const getDashboardStats = async (
  companyId: string
) => {
  const [users, tasks, sessions] = await Promise.all([
    prisma.user.findMany({
      where: {
        companyId,
      },
      select: {
        id: true,
        name: true,
        role: true,
        status: true,
        lastLoginAt: true,
      },
      orderBy: {
        name: "asc",
      },
    }),

    prisma.task.count({
      where: {
        companyId,
      },
    }),

    prisma.userSession.findMany({
      where: {
        companyId,
      },
      select: {
        userId: true,
        lastSeenAt: true,
        loginAt: true,
        logoutAt: true,
      },
      orderBy: {
        loginAt: "desc",
      },
    }),
  ]);

  // Keep only the latest session for each user
  const latestSessions = new Map<string, (typeof sessions)[number]>();

  for (const session of sessions) {
    if (!latestSessions.has(session.userId)) {
      latestSessions.set(session.userId, session);
    }
  }

  const now = Date.now();

  const team = users.map((user) => {
    const session = latestSessions.get(user.id);

    const isOnline =
      !!session &&
      !session.logoutAt &&
      !!session.lastSeenAt &&
      now - new Date(session.lastSeenAt).getTime() <
        10 * 60 * 1000;

    return {
      id: user.id,
      name: user.name,
      role: user.role,
      status: isOnline ? "ONLINE" : "OFFLINE",
      lastSeenAt: session?.lastSeenAt ?? null,
      lastLoginAt: user.lastLoginAt,
    };
  });

  return {
    users: users.length,
    tasks,
    team,
  };
};