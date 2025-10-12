import { prisma } from "../../configs/prisma.config";
import { decrypt } from "../../utils/crypto";
import speakeasy from "speakeasy";
import sendResponse from "../../libs/sendResponse";
import { StatusCodes } from "http-status-codes";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";

export const confirm2FA = async (req: Request, res: Response) => {
  try {
    const { token, userId } = req.body;

    if (!userId || !token) {
      return sendResponse({
        res,
        statusCode: StatusCodes.BAD_REQUEST,
        message: "User ID and 2FA token are required",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      omit: { password: true },
    });

    if (!user) {
      return sendResponse({
        res,
        statusCode: StatusCodes.NOT_FOUND,
        message: "User not found",
      });
    }

    if (!user.isTwoFAEnable || !user.twoFASecret) {
      return sendResponse({
        res,
        statusCode: StatusCodes.BAD_REQUEST,
        message: "2FA is not enabled for this account",
      });
    }

    const decryptedSecret = decrypt(user.twoFASecret);

    const verified = speakeasy.totp.verify({
      secret: decryptedSecret,
      encoding: "base32",
      token,
      window: 1, // allow ±1 step for time drift
    });

    if (!verified) {
      return sendResponse({
        res,
        statusCode: StatusCodes.BAD_REQUEST,
        message: "Invalid or expired 2FA code",
      });
    }

    // ✅ Optional: Generate JWT after successful 2FA login
    // const accessToken = jwt.sign(
    //   { userId: user.id, email: user.email },
    //   process.env.JWT_SECRET!,
    //   { expiresIn: "1h" }
    // );

    return sendResponse({
      res,
      statusCode: StatusCodes.OK,
      message: "2FA verified successfully",
      data: {
        user,
        // accessToken,
      },
    });
  } catch (error: any) {
    console.error("Confirm 2FA error:", error);
    return sendResponse({
      res,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Failed to confirm 2FA",
    });
  }
};
