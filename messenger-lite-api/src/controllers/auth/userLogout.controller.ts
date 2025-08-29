import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import sendResponse from "../../libs/sendResponse";
import { prisma } from "../../configs/prisma.config";
import { verifyJWT } from "../../utils/jwt";
import type { IOServerWithHelpers } from "../../socket/initSocket";

export default function userLogout(io: IOServerWithHelpers) {
  return async (req: Request, res: Response): Promise<Response> => {
    try {
      // read cookie directly (no middleware to keep it self-contained)
      const token = (req as any).cookies?.accessToken as string | undefined;
      const { id } = verifyJWT(token);

      await prisma.user.update({ where: { id }, data: { isOnline: false } });

      // proactively disconnect sockets for this user (optional but nice)
      io.disconnectUser(id);

      res.clearCookie("accessToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      return sendResponse({
        res,
        statusCode: StatusCodes.OK,
        message: "User logged out successfully",
        data: null,
      });
    } catch (error) {
      console.error("Logout error:", error);

      res.clearCookie("accessToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      return sendResponse({
        res,
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Internal server error during logout",
        data: null,
      });
    }
  };
}
