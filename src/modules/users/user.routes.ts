import { Router } from "express";

import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  updateUserStatus,
  deleteUser,
} from "./user.controller";

import {
  authenticate,
} from "../../core/middleware/auth.middleware";

const router = Router();

router.use(authenticate);

router.get("/", getUsers);

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