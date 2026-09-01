import { prisma } from "../../core/database/prisma";
import { AppError } from "../../core/errors/AppError";
import { UserRole } from "@prisma/client";

export class TaskCommentService {
  /**
   * Add a comment to a task.
   *
   * Admin can comment on any task.
   * Assigned user can comment only on their assigned task.
   */
  async createComment(
    companyId: string,
    userId: string,
    role: UserRole,
    taskId: string,
    message: string
  ) {
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        companyId,
      },
      select: {
        id: true,
        assignedToId: true,
      },
    });

    if (!task) {
      throw new AppError("Task not found", 404);
    }

    if (
      role !== UserRole.ADMIN &&
      task.assignedToId !== userId
    ) {
      throw new AppError("Access denied", 403);
    }

    const comment = await prisma.taskComment.create({
      data: {
        taskId,
        userId,
        message: message.trim(),
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
    });

    return comment;
  }

  /**
   * Update a comment.
   *
   * Admin can edit any comment.
   * Normal users can edit only their own comment.
   */
  async updateComment(
    companyId: string,
    userId: string,
    role: UserRole,
    taskId: string,
    commentId: string,
    message: string
  ) {
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        companyId,
      },
      select: {
        id: true,
      },
    });

    if (!task) {
      throw new AppError("Task not found", 404);
    }

    const comment =
      await prisma.taskComment.findFirst({
        where: {
          id: commentId,
          taskId,
        },
      });

    if (!comment) {
      throw new AppError(
        "Comment not found",
        404
      );
    }

    if (
      role !== UserRole.ADMIN &&
      comment.userId !== userId
    ) {
      throw new AppError(
        "Access denied",
        403
      );
    }

    const updated =
      await prisma.taskComment.update({
        where: {
          id: commentId,
        },
        data: {
          message: message.trim(),
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
      });

    return updated;
  }

  /**
   * Delete a comment.
   *
   * Admin can delete any comment.
   * Normal users can delete only their own comment.
   */
  async deleteComment(
    companyId: string,
    userId: string,
    role: UserRole,
    taskId: string,
    commentId: string
  ) {
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        companyId,
      },
      select: {
        id: true,
      },
    });

    if (!task) {
      throw new AppError("Task not found", 404);
    }

    const comment =
      await prisma.taskComment.findFirst({
        where: {
          id: commentId,
          taskId,
        },
      });

    if (!comment) {
      throw new AppError(
        "Comment not found",
        404
      );
    }

    if (
      role !== UserRole.ADMIN &&
      comment.userId !== userId
    ) {
      throw new AppError(
        "Access denied",
        403
      );
    }

    await prisma.taskComment.delete({
      where: {
        id: commentId,
      },
    });

    return {
      message: "Comment deleted successfully",
    };
  }
}