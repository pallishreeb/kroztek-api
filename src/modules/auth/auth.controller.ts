import {
  Request,
  Response,
  NextFunction,
} from "express";

import { AuthService } from "./auth.service";
import { AuthRequest } from "../../core/middleware/auth.middleware";
const authService = new AuthService();

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      email,
      password,
    } = req.body;

    const result =
      await authService.login(
        email,
        password
      );

    res.json({
      success: true,
      message:
        "Login successful",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const me = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const user = await authService.getMe(
      req.user.id
    );

    return res.status(200).json({
      success: true,
      message: "User fetched successfully",
      data: user,
    });
  } catch (error: any) {
    return res.status(404).json({
      success: false,
      message:
        error?.message || "User not found",
    });
  }
};

export const updatePassword = async (
  req: AuthRequest,
  res: Response
) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  const {
    currentPassword,
    newPassword,
  } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message:
        "Current password and new password are required",
    });
  }

  const result =
    await authService.updatePassword(
      req.user.id,
      currentPassword,
      newPassword
    );

  return res.status(200).json({
    success: true,
    message: result.message,
  });
};