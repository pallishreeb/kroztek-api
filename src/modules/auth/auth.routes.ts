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

export default router;