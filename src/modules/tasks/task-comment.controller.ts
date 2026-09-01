import {
  Response,
  NextFunction,
} from "express";

import { AuthRequest } from "../../types/auth";
import { AppError } from "../../core/errors/AppError";
import { TaskCommentService } from "./task-comment.service";

const taskCommentService =
  new TaskCommentService();

export const createTaskComment =
  async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.user) {
        throw new AppError(
          "Unauthorized",
          401
        );
      }

      const { taskId } = req.params;
      const { message } = req.body;

      if (
        !message ||
        typeof message !== "string" ||
        !message.trim()
      ) {
        throw new AppError(
          "Comment message is required",
          400
        );
      }

      const comment =
        await taskCommentService.createComment(
          req.user.companyId,
          req.user.id,
          req.user.role,
          taskId,
          message
        );

      return res.status(201).json({
        success: true,
        message:
          "Comment added successfully",
        data: comment,
      });
    } catch (error) {
      next(error);
    }
  };

export const updateTaskComment =
  async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.user) {
        throw new AppError(
          "Unauthorized",
          401
        );
      }

      const {
        taskId,
        commentId,
      } = req.params;

      const { message } = req.body;

      if (
        !message ||
        typeof message !== "string" ||
        !message.trim()
      ) {
        throw new AppError(
          "Comment message is required",
          400
        );
      }

      const comment =
        await taskCommentService.updateComment(
          req.user.companyId,
          req.user.id,
          req.user.role,
          taskId,
          commentId,
          message
        );

      return res.json({
        success: true,
        message:
          "Comment updated successfully",
        data: comment,
      });
    } catch (error) {
      next(error);
    }
  };

export const deleteTaskComment =
  async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.user) {
        throw new AppError(
          "Unauthorized",
          401
        );
      }

      const {
        taskId,
        commentId,
      } = req.params;

      const result =
        await taskCommentService.deleteComment(
          req.user.companyId,
          req.user.id,
          req.user.role,
          taskId,
          commentId
        );

      return res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  };