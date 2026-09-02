import { Request, Response } from "express";
import { getRecentAuditLogs } from "./audit.service";

export const getRecentActivity = async (
  req: Request,
  res: Response
) => {
  try {
    const companyId = req.user.companyId;
    const limit = Number(req.query.limit) || 10;

    const activities = await getRecentAuditLogs(
      companyId,
      limit
    );

    return res.json(activities);
  } catch (error) {
    console.error("Failed to get recent activity:", error);

    return res.status(500).json({
      code: "AU500",
      message: "Failed to fetch recent activity",
    });
  }
};