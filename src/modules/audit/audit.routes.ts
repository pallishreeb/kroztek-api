import { Router } from "express";
import { authenticate } from "../../core/middleware/auth.middleware";
import { requireRole } from "../../core/middleware/role.middleware";
import { UserRole } from "@prisma/client";
import { getRecentActivity } from "./audit.controller";

const router = Router();

router.use(authenticate);

router.get(
  "/recent",
  requireRole(UserRole.ADMIN),
  getRecentActivity
);

export default router;