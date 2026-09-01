import {
  Response,
  NextFunction,
} from "express";

import { UserRole } from "@prisma/client";

import { AppError } from "../errors/AppError";
import { AuthRequest } from "../../types/auth";

export const requireRole =
  (...roles: UserRole[]) =>
  (
    req: AuthRequest,
    _res: Response,
    next: NextFunction
  ) => {

    if (!req.user) {
      return next(
        new AppError(
          "Unauthorized",
          401
        )
      );
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          "Access denied",
          403
        )
      );
    }

    next();
  };

export const requireAdmin = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {

  if (!req.user) {
    return next(
      new AppError(
        "Authentication required",
        401
      )
    );
  }

  if (req.user.role !== UserRole.ADMIN) {
    return next(
      new AppError(
        "Admin access required",
        403
      )
    );
  }

  next();
};