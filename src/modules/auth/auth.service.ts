import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { prisma } from "../../core/database/prisma";
import { AppError } from "../../core/errors/AppError";
import { env } from "../../config/env";

export class AuthService {
  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }

    if (user.status !== "ACTIVE") {
      throw new AppError("User account is inactive", 403);
    }

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      throw new AppError("Invalid email or password", 401);
    }

    await prisma.user.update({
      where: {
        id: user.id,
      },

      data: {
        lastLoginAt: new Date(),
      },
    });
    await prisma.userSession.create({
      data: {
        companyId: user.companyId,
        userId: user.id,
        lastSeenAt: new Date(),
      },
    });
    const payload = {
      id: user.id,
      companyId: user.companyId,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    const accessToken = jwt.sign(payload, env.jwtAccessSecret, {
      expiresIn: "1d",
    });

    const refreshToken = jwt.sign(payload, env.jwtRefreshSecret, {
      expiresIn: "30d",
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyId: user.companyId,
      },

      accessToken,
      refreshToken,
    };
  }

  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },

      include: {
        company: true,
      },
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      companyId: user.companyId,

      company: {
        id: user.company.id,
        name: user.company.name,
      },
    };
  }

  async updatePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const valid = await bcrypt.compare(currentPassword, user.password);

    if (!valid) {
      throw new AppError("Current password is incorrect", 400);
    }

    if (currentPassword === newPassword) {
      throw new AppError(
        "New password must be different from current password",
        400,
      );
    }

    if (newPassword.length < 8) {
      throw new AppError("New password must be at least 8 characters", 400);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: {
        id: userId,
      },

      data: {
        password: hashedPassword,
      },
    });

    return {
      message: "Password updated successfully",
    };
  }

  async heartbeat(userId: string) {
  await prisma.userSession.updateMany({
    where: {
      userId,
      logoutAt: null,
    },
    data: {
      lastSeenAt: new Date(),
    },
  });

  return {
    message: "Heartbeat updated",
  };
}
}
