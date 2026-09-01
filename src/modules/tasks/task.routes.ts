import { Router } from "express";

import {
  getTasks,
  getTask,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  getTaskActivities,
  createTaskActivity,
    addActivityPhotos,
    updateTaskActivity,
    deleteActivityPhoto,
    deleteTaskActivity,
} from "./task.controller";
import {
  createTaskComment,
  updateTaskComment,
  deleteTaskComment,
} from "./task-comment.controller";
import { authenticate } from "../../core/middleware/auth.middleware";
import {
  uploadActivityPhotos,
} from "../../core/middleware/upload.middleware";
import { requireRole } from "../../core/middleware/role.middleware";

import { UserRole } from "@prisma/client";

const router = Router();

router.use(authenticate);

// Get all tasks
router.get(
  "/",
  requireRole(UserRole.ADMIN),
  getTasks
);

// Get single task
router.get(
  "/:id",
  requireRole(
    UserRole.ADMIN,
    UserRole.SALES,
    UserRole.TECHNICIAN
  ),
  getTask
);

// Create task
router.post(
  "/",
  requireRole(UserRole.ADMIN),
  createTask
);
// Task Activities
router.get("/:id/activities", getTaskActivities);
router.post("/:id/activities", createTaskActivity);
// Update task details
router.patch(
  "/:id",
  requireRole(UserRole.ADMIN),
  updateTask
);

// Update task status
router.patch(
  "/:id/status",
  requireRole(
    UserRole.ADMIN,
    UserRole.SALES,
    UserRole.TECHNICIAN
  ),
  updateTaskStatus
);

// Delete task
router.delete(
  "/:id",
  requireRole(UserRole.ADMIN),
  deleteTask
);
router.post(
  "/:taskId/activities/:activityId/photos",
  uploadActivityPhotos.array(
    "photos",
    5
  ),
  addActivityPhotos
);

router.patch(
  "/:taskId/activities/:activityId",
  updateTaskActivity
);

router.delete(
  "/:taskId/activities/:activityId",
  deleteTaskActivity
);

router.delete(
  "/:taskId/activities/:activityId/photos/:photoId",
  deleteActivityPhoto
);
// Task Comments

router.post(
  "/:taskId/comments",
  createTaskComment
);

router.patch(
  "/:taskId/comments/:commentId",
  updateTaskComment
);

router.delete(
  "/:taskId/comments/:commentId",
  deleteTaskComment
);
export default router;