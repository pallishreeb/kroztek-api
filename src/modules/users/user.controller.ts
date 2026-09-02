import { NextFunction, Response } from "express";

import { UserService } from "./user.service";

import { AuthRequest } from "../../types/auth";
import { AppError } from "../../core/errors/AppError";

import { UserSessionService } from "./user.service";

const userSessionService = new UserSessionService();


const userService = new UserService();

export const getUsers = async (
  req: AuthRequest,
  res: Response
) => {
  if (!req.user) {
    throw new AppError(
      "Authentication required",
      401
    );
  }

  const users =
    await userService.getUsers(
      req.user.companyId
    );

  return res.status(200).json({
    success: true,
    message: "Users fetched successfully",
    data: users,
  });
};

export const getUser = async (
  req: AuthRequest,
  res: Response
) => {
const { id } = req.params;

if (typeof id !== "string") {
  throw new AppError("Invalid user ID", 400);
}

  if (!req.user) {
    throw new AppError(
      "Authentication required",
      401
    );
  }

  const user =
    await userService.getUser(
      req.user.companyId,
      id
    );

  return res.status(200).json({
    success: true,
    message: "User fetched successfully",
    data: user,
  });
};

export const createUser = async (
  req: AuthRequest,
  res: Response
) => {
  if (!req.user) {
    throw new AppError(
      "Authentication required",
      401
    );
  }

  const {
    name,
  email,
  phone,
  password,
  role,
  } = req.body;

  if (
    !name ||
    !email ||
    !password ||
    !role
  ) {
    throw new AppError(
      "Name, email, password and role are required",
      400
    );
  }

  if (
    role !== "SALES" &&
    role !== "TECHNICIAN"
  ) {
    throw new AppError(
      "Invalid user role",
      400
    );
  }

  if (password.length < 8) {
    throw new AppError(
      "Password must be at least 8 characters",
      400
    );
  }

  const user =
    await userService.createUser(
      req.user.companyId,
      {
        name,
        email: email.toLowerCase().trim(),
        phone,
        password,
        role,
      }
    );

  return res.status(201).json({
    success: true,
    message: "User created successfully",
    data: user,
  });
};

export const updateUser = async (
  req: AuthRequest,
  res: Response
) => {
    const { id } = req.params;

if (typeof id !== "string") {
  throw new AppError("Invalid user ID", 400);
}
  if (!req.user) {
    throw new AppError(
      "Authentication required",
      401
    );
  }

  const user =
    await userService.updateUser(
      req.user.companyId,
      id,
      req.body
    );

  return res.status(200).json({
    success: true,
    message: "User updated successfully",
    data: user,
  });
};

export const updateUserStatus =
  async (
    req: AuthRequest,
    res: Response
  ) => {
    const { id } = req.params;

if (typeof id !== "string") {
  throw new AppError("Invalid user ID", 400);
}
    if (!req.user) {
      throw new AppError(
        "Authentication required",
        401
      );
    }

    const { status } = req.body;

    if (
      status !== "ACTIVE" &&
      status !== "INACTIVE"
    ) {
      throw new AppError(
        "Invalid status",
        400
      );
    }

    const user =
      await userService.updateStatus(
        req.user.companyId,
        id,
        status
      );

    return res.status(200).json({
      success: true,
      message: "User status updated successfully",
      data: user,
    });
  };

export const deleteUser = async (
  req: AuthRequest,
  res: Response
) => {
    const { id } = req.params;

if (typeof id !== "string") {
  throw new AppError("Invalid user ID", 400);
}
  if (!req.user) {
    throw new AppError(
      "Authentication required",
      401
    );
  }

  const result =
    await userService.deleteUser(
      req.user.companyId,
      id
    );

  return res.status(200).json({
    success: true,
    message: result.message,
  });
};



export const getUserSessions = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.user.role !== "ADMIN") {
      throw new AppError(
        "Admin access required",
        403
      );
    }

    const date =
      typeof req.query.date === "string"
        ? req.query.date
        : undefined;

    const sessions =
      await userSessionService.getSessions(
        req.user.companyId,
        date
      );

    return res.json({
      success: true,
      data: sessions,
    });
  } catch (error) {
    next(error);
  }
};