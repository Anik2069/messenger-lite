import bcrypt from "bcrypt";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";
import { prisma } from "../../configs/prisma.config";
import { signJWT } from "../../utils/jwt";
import sendResponse from "../../libs/sendResponse";
import type { Response, Request } from "express";
import type { IOServerWithHelpers } from "../../socket/initSocket";

const userSigninDto = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function userSignin(io: IOServerWithHelpers) {
  return async (req: Request, res: Response) => {
    try {
      const { email, password } = userSigninDto.parse(req.body);

      const user = await prisma.user.findFirst({ where: { email } });
      if (!user) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: "User not found" });
      }

      const ok = await bcrypt.compare(password, user.password);
      if (!ok) {
        return res
          .status(StatusCodes.UNAUTHORIZED)
          .json({ message: "Invalid password" });
      }

      const id = user.id;
      const accessToken = signJWT({ id }, "24h");

      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000,
      });

      await prisma.user.update({ where: { id }, data: { isOnline: true } });

      const parts = await prisma.conversationParticipant.findMany({
        where: { userId: id },
        select: { conversationId: true },
      });
      for (const p of parts) {
        io.to(io.convRoom(p.conversationId)).emit("presence_update", {
          userId: id,
          isOnline: true,
        });
      }

      const userInfo = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          username: true,
          email: true,
          isOnline: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return sendResponse({
        res,
        statusCode: StatusCodes.OK,
        message: "User signed in successfully",
        data: { userInfo },
      });
    } catch (error: any) {
      if (error?.issues) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: "Validation Error", errors: error.issues });
      }
      console.error("Signin error:", error);
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal server error" });
    }
  };
}
