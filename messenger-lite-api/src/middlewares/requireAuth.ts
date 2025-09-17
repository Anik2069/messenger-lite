import { Request, Response, NextFunction } from "express";
import { verifyJWT } from "../utils/jwt";

export default function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // 1) Prefer HttpOnly cookie, fallback to Authorization header
    const cookieToken = (req as any).cookies?.accessToken as string | undefined;

    const bearerHeader = req.headers.authorization;
    // console.log("Authorization header:", req.headers.authorization);

    const bearerToken =
      bearerHeader && bearerHeader.startsWith("Bearer ")
        ? bearerHeader.slice(7)
        : undefined;

    const token = cookieToken ?? bearerToken;
    // const token = bearerToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        code: "TOKEN_MISSING",
        message: "Unauthorized",
      });
    }

    // 2) Verify token (your verifyJWT should throw on invalid/expired)
    const payload = verifyJWT<any>(token);

    // 3) Ensure an id exists in the payload (align with how you sign it)
    const id = payload?.id as string | undefined;
    if (!id) {
      return res.status(401).json({
        success: false,
        code: "TOKEN_INVALID",
        message: "Unauthorized",
      });
    }

    // 4) Attach to req for downstream handlers
    (req as any).userId = id; // backwards-compat with your code
    (req as any).auth = { userId: id, token, payload }; // richer context if needed

    return next();
  } catch (err: any) {
    const msg = String(err?.message || "");
    if (msg.toLowerCase().includes("expired")) {
      return res.status(401).json({
        success: false,
        code: "TOKEN_EXPIRED",
        message: "Unauthorized",
      });
    }
    return res
      .status(401)
      .json({ success: false, code: "TOKEN_INVALID", message: "Unauthorized" });
  }
}
