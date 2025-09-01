import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";

export function middleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : authHeader;

  try {
    const decoded = jwt.verify(token || "", JWT_SECRET);
    //@ts-ignore
    req.userId = (decoded as any).userId;
    next();
  } catch (err) {
    res.status(403).json({ message: "Unauthorized" });
  }
}
