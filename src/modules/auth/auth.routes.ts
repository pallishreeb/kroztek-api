import { Router } from "express";

import {
  heartbeat,
  login,
  logout,
  me,
  updatePassword,
} from "./auth.controller";

import {
  authenticate,
} from "../../core/middleware/auth.middleware";
import { UserRole } from "@prisma/client";
import { requireRole } from "../../core/middleware/role.middleware";
import { updateProfile } from "./auth.controller";
const router = Router();

router.post(
  "/login",
  login
);
router.post(
  "/logout",
  authenticate,
  logout
);

router.get(
  "/me",
  authenticate,
  me
);

router.patch(
  "/password",
  authenticate,
  updatePassword
);

router.patch(
  "/heartbeat",
  authenticate,
  heartbeat
);
router.patch(
  "/profile",
  authenticate,
  updateProfile,
);
export default router;