import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import sendResponse from "../../libs/sendResponse";
import { prisma } from "../../configs/prisma.config";
import { verifyJWT } from "../../utils/jwt";
import type { IOServerWithHelpers } from "../../socket/initSocket";
import { z } from "zod";

const userSigninDto = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
export default function userActiveStatus(io: IOServerWithHelpers) {
  return async (req: Request, res: Response): Promise<Response> => {
    try {
      const { email, password } = userSigninDto.parse(req.body);

      return sendResponse({
        res,
        statusCode: StatusCodes.OK,
        message: "User logged out successfully",
        data: null,
      });
    } catch (e: any) {
      console.error("Unexpected logout error:", e?.message);

      return sendResponse({
        res,
        statusCode: StatusCodes.OK,
        message: "Session cleared",
        data: null,
      });
    }
  };
}
