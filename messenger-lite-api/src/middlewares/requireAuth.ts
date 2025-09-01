import { Request, Response, NextFunction } from "express";
import { verifyJWT } from "../utils/jwt";

export default function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const token = (req as any).cookies?.accessToken as string | undefined;
    const { id } = verifyJWT(token);
    (req as any).userId = id;
    next();
  } catch (e: any) {
    return res
      .status(401)
      .json({ success: false, message: e?.message || "Unauthorized" });
  }
}
