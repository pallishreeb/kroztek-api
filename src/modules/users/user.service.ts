import bcrypt from "bcryptjs";

import { prisma } from "../../core/database/prisma";
import { AppError } from "../../core/errors/AppError";

type CreateUserInput = {
  name: string;
  email: string;
  phone?: string;
  password: string;
  role: "SALES" | "TECHNICIAN";
};

type UpdateUserInput = {
  name?: string;
  email?: string;
  phone?: string;
  role?: "SALES" | "TECHNICIAN";
};

export class UserService {
  async getUsers(companyId: string) {
    return prisma.user.findMany({
      where: {
        companyId,
      },

      select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          status: true,
          lastLoginAt: true,
          createdAt: true,
      },

      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async getUser(
    companyId: string,
    userId: string
  ) {
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        companyId,
      },

      select: {
         id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new AppError(
        "User not found",
        404
      );
    }

    return user;
  }

 async createUser(
  companyId: string,
  input: CreateUserInput
) {
  const existing =
    await prisma.user.findUnique({
      where: {
        email: input.email,
      },
    });

  if (existing) {
    throw new AppError(
      "User with this email already exists",
      409
    );
  }

  const hashedPassword =
    await bcrypt.hash(
      input.password,
      12
    );

  const user =
    await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        phone: input.phone,
        password: hashedPassword,
        role: input.role,
        status: "ACTIVE",
        companyId,
      },

      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        companyId: true,
        createdAt: true,
      },
    });

  return user;
}

  async updateUser(
    companyId: string,
    userId: string,
    input: UpdateUserInput
  ) {
    const existing =
      await prisma.user.findFirst({
        where: {
          id: userId,
          companyId,
        },
      });

    if (!existing) {
      throw new AppError(
        "User not found",
        404
      );
    }

    if (input.email) {
      const emailExists =
        await prisma.user.findFirst({
          where: {
            email: input.email,
            NOT: {
              id: userId,
            },
          },
        });

      if (emailExists) {
        throw new AppError(
          "Email already in use",
          409
        );
      }
    }

    return prisma.user.update({
      where: {
        id: userId,
      },

      data: {
        ...(input.name !== undefined && {
          name: input.name,
        }),

        ...(input.email !== undefined && {
          email: input.email,
        }),
    ...(input.phone !== undefined && {
          email: input.phone,
        }),
        ...(input.role !== undefined && {
          role: input.role,
        }),
      },

      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        companyId: true,
        updatedAt: true,
      },
    });
  }

  async updateStatus(
    companyId: string,
    userId: string,
    status: "ACTIVE" | "INACTIVE"
  ) {
    const user =
      await prisma.user.findFirst({
        where: {
          id: userId,
          companyId,
        },
      });

    if (!user) {
      throw new AppError(
        "User not found",
        404
      );
    }

    if (user.role === "ADMIN") {
      throw new AppError(
        "Admin account cannot be deactivated",
        400
      );
    }

    return prisma.user.update({
      where: {
        id: userId,
      },

      data: {
        status,
      },

      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
      },
    });
  }

  async deleteUser(
    companyId: string,
    userId: string
  ) {
    const user =
      await prisma.user.findFirst({
        where: {
          id: userId,
          companyId,
        },
      });

    if (!user) {
      throw new AppError(
        "User not found",
        404
      );
    }

    if (user.role === "ADMIN") {
      throw new AppError(
        "Admin account cannot be deleted",
        400
      );
    }

    await prisma.user.delete({
      where: {
        id: userId,
      },
    });

    return {
      message: "User deleted successfully",
    };
  }
}


export class UserSessionService {
  async getSessions(
    companyId: string,
    date?: string
  ) {
    const where: any = {
      companyId,
    };

    if (date) {
      const start = new Date(`${date}T00:00:00.000Z`);
      const end = new Date(`${date}T23:59:59.999Z`);

      where.loginAt = {
        gte: start,
        lte: end,
      };
    }

    const sessions = await prisma.userSession.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        loginAt: "desc",
      },
    });

    return sessions;
  }
}