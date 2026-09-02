import { Response, NextFunction } from "express";

import { TaskService } from "./task.service";

import { AuthRequest } from "../../types/auth";

import { AppError } from "../../core/errors/AppError";
import { AuditAction } from "@prisma/client";
import {
  TaskPriority,
  TaskStatus,
  TaskType,
  TaskActivityType,
  UserRole,
} from "@prisma/client";
import { createAuditLog } from "../audit/audit.service";
const taskService = new TaskService();

export const getTasks = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      throw new AppError("Unauthorized", 401);
    }

    const tasks = await taskService.getTasks(
      req.user.companyId,
      req.user.id,
      req.user.role,
    );

    res.json({
      success: true,
      message: "Tasks fetched successfully",
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
};

export const getTask = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      throw new AppError("Unauthorized", 401);
    }

    const { id } = req.params;

    const task = await taskService.getTask(
      req.user.companyId,
      id,
      req.user.id,
      req.user.role,
    );

    res.json({
      success: true,
      message: "Task fetched successfully",
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

export const createTask = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      throw new AppError("Unauthorized", 401);
    }

    const {
      title,
      description,
      type,
      priority,
      assignedToId,
      scheduledDate,
      customer,
    } = req.body;

    if (
      !title ||
      !type ||
      !priority ||
      !assignedToId ||
      !scheduledDate ||
      !customer?.name
    ) {
      throw new AppError(
        "Title, type, priority, assignee, scheduled date and customer name are required",
        400,
      );
    }

    const task = await taskService.createTask(req.user.companyId, req.user.id, {
      title,
      description,
      type,
      priority,
      assignedToId,
      scheduledDate,
      customer,
    });
    await createAuditLog({
      companyId: req.user.companyId,
      userId: req.user.id,
      action: AuditAction.TASK_CREATED,
      entityType: "TASK",
      entityId: task.id,
      description: `Task "${task.title}" was created`,
    });
    return res.status(201).json({
      success: true,
      message: "Task created successfully",
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      throw new AppError("Unauthorized", 401);
    }

    if (req.user.role !== UserRole.ADMIN) {
      throw new AppError("Only admin can update task details", 403);
    }

    const { id } = req.params;

    const task = await taskService.updateTask(
      req.user.companyId,
      req.user.id,
      req.user.role,
      id,
      req.body,
    );
    await createAuditLog({
      companyId: req.user.companyId,
      userId: req.user.id,
      action: AuditAction.TASK_UPDATED,
      entityType: "TASK",
      entityId: task.id,
      description: `${req.user.name} updated task "${task.title}"`,
    });
    res.json({
      success: true,
      message: "Task updated successfully",
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

export const updateTaskStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      throw new AppError("Unauthorized", 401);
    }

    const { id } = req.params;

    const { status, rejectionReason } = req.body;

    if (!status) {
      throw new AppError("Status is required", 400);
    }

    const task = await taskService.updateStatus(
      req.user.companyId,
      id,
      status,
      rejectionReason,
    );
    await createAuditLog({
      companyId: req.user.companyId,
      userId: req.user.id,
      action: AuditAction.TASK_STATUS_CHANGED,
      entityType: "TASK",
      entityId: task.id,
      description: `${req.user.name} changed "${task.title}" to ${status}`,
    });
    res.json({
      success: true,
      message: "Task status updated successfully",
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      throw new AppError("Unauthorized", 401);
    }

    if (req.user.role !== UserRole.ADMIN) {
      throw new AppError("Only admin can delete tasks", 403);
    }

    const { id } = req.params;

    const result = await taskService.deleteTask(req.user.companyId, id);

    res.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

export const getTaskActivities = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      throw new AppError("Unauthorized", 401);
    }

    const { id } = req.params;

    const activities = await taskService.getTaskActivities(
      req.user.companyId,
      id,
      req.user.id,
      req.user.role,
    );

    return res.json({
      success: true,
      message: "Task activities fetched successfully",
      data: activities,
    });
  } catch (error) {
    next(error);
  }
};

export const createTaskActivity = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      throw new AppError("Unauthorized", 401);
    }

    const { id } = req.params;

    const { type, latitude, longitude, capturedAt, notes } = req.body;

    if (!type) {
      throw new AppError("Activity type is required", 400);
    }

    const activity = await taskService.createTaskActivity(
      req.user.companyId,
      id,
      req.user.id,
      req.user.role,
      {
        type,
        latitude,
        longitude,
        capturedAt,
        notes,
      },
    );
    await createAuditLog({
      companyId: req.user.companyId,
      userId: req.user.id,
      action: AuditAction.TASK_ACTIVITY_CREATED,
      entityType: "TASK",
      entityId: id,
      description: `${req.user.name} added a ${activity.type} activity to a task`,
    });
    return res.status(201).json({
      success: true,
      message: "Task activity created successfully",
      data: activity,
    });
  } catch (error) {
    next(error);
  }
};

export const addActivityPhotos = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      throw new AppError("Unauthorized", 401);
    }

    const { taskId, activityId } = req.params;

    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      throw new AppError("At least one photo is required", 400);
    }

    const activity = await taskService.addActivityPhotos(
      req.user.companyId,
      req.user.id,
      taskId,
      activityId,
      req.user.role,
      files,
    );
    await createAuditLog({
      companyId: req.user.companyId,
      userId: req.user.id,
      action: AuditAction.TASK_ACTIVITY_PHOTO_ADDED,
      entityType: "TASK",
      entityId: taskId,
      description: `${req.user.name} added photo(s) to a task activity`,
    });
    return res.status(201).json({
      success: true,
      message: "Activity photos uploaded successfully",
      data: activity,
    });
  } catch (error) {
    next(error);
  }
};

export const updateTaskActivity = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      throw new AppError("Unauthorized", 401);
    }

    const { taskId, activityId } = req.params;

    const { type, notes, latitude, longitude, capturedAt } = req.body;

    let activityType: TaskActivityType | undefined;

    if (type !== undefined) {
      if (!Object.values(TaskActivityType).includes(type)) {
        throw new AppError("Invalid activity type", 400);
      }

      activityType = type;
    }

    const activity = await taskService.updateTaskActivity(
      req.user.companyId,
      req.user.id,
      req.user.role,
      taskId,
      activityId,
      {
        type: activityType,
        notes,
        latitude,
        longitude,
        capturedAt,
      },
    );
    await createAuditLog({
      companyId: req.user.companyId,
      userId: req.user.id,
      action: AuditAction.TASK_ACTIVITY_UPDATED,
      entityType: "TASK",
      entityId: taskId,
      description: `${req.user.name} updated a task activity`,
    });
    return res.json({
      success: true,
      message: "Task activity updated successfully",
      data: activity,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteActivityPhoto = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      throw new AppError("Unauthorized", 401);
    }

    const { taskId, activityId, photoId } = req.params;

    const result = await taskService.deleteActivityPhoto(
      req.user.companyId,
      req.user.id,
      req.user.role,
      taskId,
      activityId,
      photoId,
    );
    await createAuditLog({
      companyId: req.user.companyId,
      userId: req.user.id,
      action: AuditAction.TASK_ACTIVITY_PHOTO_DELETED,
      entityType: "TASK",
      entityId: taskId,
      description: `${req.user.name} deleted a photo from a task activity`,
    });
    return res.json({
      success: true,
      message: "Activity photo deleted successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTaskActivity = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      throw new AppError("Unauthorized", 401);
    }

    const { taskId, activityId } = req.params;

    const result = await taskService.deleteTaskActivity(
      req.user.companyId,
      req.user.id,
      req.user.role,
      taskId,
      activityId,
    );
    await createAuditLog({
      companyId: req.user.companyId,
      userId: req.user.id,
      action: AuditAction.TASK_ACTIVITY_DELETED,
      entityType: "TASK",
      entityId: taskId,
      description: `${req.user.name} deleted a task activity`,
    });
    return res.json({
      success: true,
      message: "Task activity deleted successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
