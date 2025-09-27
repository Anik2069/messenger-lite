import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import sendResponse from "../../libs/sendResponse";
import { prisma } from "../../configs/prisma.config";
import { verifyJWT } from "../../utils/jwt";
import type { IOServerWithHelpers } from "../../socket/initSocket";

export default function userLogout(io: IOServerWithHelpers) {
  return async (req: Request, res: Response): Promise<Response> => {
    const sameSite = (process.env.CROSS_SITE === "true" ? "none" : "strict") as
      | "none"
      | "lax"
      | "strict";
    const secure = process.env.NODE_ENV === "production";
    const cookieOptions = {
      httpOnly: true,
      sameSite,
      secure,
      path: "/" as const,
      // domain: "your.domain" // only if you also set this on signin
    };

    let userId: string | undefined;

    try {
      console.log("Processing logout request");
      const cookieToken = (req as any).cookies?.accessToken as
        | string
        | undefined;
      const auth = req.headers.authorization;
      const bearer =
        auth && auth.startsWith("Bearer ") ? auth.slice(7) : undefined;
      const token = cookieToken ?? bearer;
      if (token) {
        try {
          const payload = verifyJWT<{ id: string }>(token);
          userId = payload?.id;
        } catch {}
      }
      if (!userId)
        throw Error(`No user ID found in JWT token ${JSON.stringify(token)}!`);

      if (userId) {
        const userInfo = await prisma.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            username: true,
            email: true,
            isOnline: true,
            createdAt: true,
            updatedAt: true,
          },
        });

        // try {
        // await prisma.user.update({
        //   where: { id: userId },
        //   data: { isOnline: false },
        // });
        // console.log("User set to offline:", userId);
        // } catch (e: any) {
        //   console.error("Logout DB update error:", e?.message);
        // }
        // try {
        //   io.disconnectUser();
        // } catch (e: any) {
        //   console.error("Socket disconnect error:", e?.message);
        // }
      }

      res.clearCookie("accessToken", cookieOptions);

      return sendResponse({
        res,
        statusCode: StatusCodes.OK,
        message: "User logged out successfully",
        data: null,
      });
    } catch (e: any) {
      console.error("Unexpected logout error:", e?.message);
      res.clearCookie("accessToken", cookieOptions);

      return sendResponse({
        res,
        statusCode: StatusCodes.OK,
        message: "Session cleared",
        data: null,
      });
    }
  };
}
