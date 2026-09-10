import { Request } from "express";
import { UserRole } from "@prisma/client";

export interface AuthUser {
  id: string;
  companyId: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}