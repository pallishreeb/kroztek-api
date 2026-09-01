import { Router } from "express";

import {
  login,
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

export default router;