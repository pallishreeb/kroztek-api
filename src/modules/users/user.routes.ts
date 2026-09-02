import { Router } from "express";

import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  updateUserStatus,
  deleteUser,
  getUserSessions,
} from "./user.controller";

import {
  authenticate,
} from "../../core/middleware/auth.middleware";

const router = Router();

router.use(authenticate);

router.get("/", getUsers);
router.get(
  "/sessions",
  authenticate,
  getUserSessions
);
router.get("/:id", getUser);

router.post("/", createUser);

router.put(
  "/:id",
  updateUser
);

router.patch(
  "/:id/status",
  updateUserStatus
);

router.delete(
  "/:id",
  deleteUser
);

export default router;