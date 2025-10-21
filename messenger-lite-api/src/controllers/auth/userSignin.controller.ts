import bcrypt from "bcrypt";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";
import { prisma } from "../../configs/prisma.config";
import { signJWT } from "../../utils/jwt";
import sendResponse from "../../libs/sendResponse";
import type { Response, Request } from "express";
import type { IOServerWithHelpers } from "../../socket/initSocket";
import { DeviceInfo, trackDevice } from "../../utils/deviceTracker";

const userSigninDto = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const TOKEN_EXPIRY = "12h";
const COOKIE_EXPIRY_MS = 12 * 60 * 60 * 1000; // 12 hours

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
      if (!user.password) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: "This account cannot sign in with a password" });
      }

      const ok = await bcrypt.compare(password, user.password);
      if (!ok) {
        return res
          .status(StatusCodes.UNAUTHORIZED)
          .json({ message: "Invalid password" });
      }

      const id = user.id;
      const accessToken = signJWT({ id }, TOKEN_EXPIRY);

      // IMPORTANT: set cookie
      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.CROSS_SITE === "true" ? "none" : "strict",
        maxAge: COOKIE_EXPIRY_MS,
      });

      // (Optional DEV check) confirm Set-Cookie contains our token
      // if (process.env.NODE_ENV !== "production") {
      //   const sc = res.getHeader("set-cookie");
      //   const cookieHasToken =
      //     (Array.isArray(sc) &&
      //       sc.some(
      //         (c) =>
      //           typeof c === "string" &&
      //           c.startsWith(`accessToken=${accessToken}`)
      //       )) ||
      //     (typeof sc === "string" &&
      //       sc.startsWith(`accessToken=${accessToken}`));
      //   console.log("Cookie set matches token? ", cookieHasToken);
      // }

      // await prisma.user.update({ where: { id }, data: { isOnline: true } });

      const parts = await prisma.conversationParticipant.findMany({
        where: { userId: id },
        select: { conversationId: true },
      });
      const convIds = parts.map((p) => io.convRoom(p.conversationId));
      if (convIds.length) {
        io.to(convIds).emit("presence_update", { userId: id, isOnline: true });
      }

      if (user?.isTwoFAEnable) {
        return sendResponse({
          res,
          statusCode: StatusCodes.OK,
          message: "User signed in successfully",
          data: { accessToken, twoFA: user?.isTwoFAEnable, userId: user.id },
        });
      } else {
        const userInfo = await prisma.user.findUnique({
          where: { id },
          omit: { password: true, twoFASecret: true },
        });
        console.log("User signed in:", userInfo);
        const deviceInfo: DeviceInfo = await trackDevice(req as any);
        let currentDeviceId = null;

        const existingDevice = await prisma.userDevice.findFirst({
          where: {
            user_id: user.id,
            user_agent: deviceInfo.user_agent,
            os: deviceInfo.os,
            ip_address: deviceInfo.ip_address,
            browser: deviceInfo.browser,
            device_type: deviceInfo.device_type,
          },
        });
        if (existingDevice) {
          currentDeviceId = existingDevice.id;
          await prisma.userDevice.update({
            where: { id: existingDevice.id },
            data: { last_active: new Date() },
          });
        } else {
          // Device is new but user already passed 2FA, create it as untrusted (or trusted if you want)
          const isFromPostman = false;
          // deviceInfo.user_agent.includes("PostmanRuntime");
          if (!isFromPostman) {
            const newDevice = await prisma.userDevice.create({
              data: {
                user_id: user.id,
                ip_address: deviceInfo.ip_address,
                user_agent: deviceInfo.user_agent,
                os: deviceInfo.os,
                browser: deviceInfo.browser,
                device_type: deviceInfo.device_type,
                trusted: false,
                last_active: new Date(),
              },
            });
            currentDeviceId = newDevice.id;
          }
        }

        console.log(deviceInfo, "deviceInfo");
        return sendResponse({
          res,
          statusCode: StatusCodes.OK,
          message: "User signed in successfully",
          data: { userInfo, accessToken, twoFA: user?.isTwoFAEnable },
        });
      }
    } catch (error: any) {
      if (error?.issues) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: "Validation Error", errors: error.issues });
      }
      if (error.code?.startsWith("P")) {
        console.error("Database error:", {
          code: error.code,
          message: error.message,
        });
        return res
          .status(StatusCodes.SERVICE_UNAVAILABLE)
          .json({ message: "Database unavailable, please try again later" });
      }
      console.error("Signin error:", {
        message: error.message,
        stack: error.stack,
      });
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal server error" });
    }
  };
}
