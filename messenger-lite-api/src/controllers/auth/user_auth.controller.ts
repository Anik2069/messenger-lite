import { prisma } from "../../configs/prisma.config";
import { decrypt, encrypt } from "../../utils/crypto";
import speakeasy from "speakeasy";
import qrcode from "qrcode";
import sendResponse from "../../libs/sendResponse";
import { StatusCodes } from "http-status-codes";
import { Request, Response } from "express";

/**
 * Generate 2FA secret and QR code for user
 */
export const generate2FA = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth.userId;
    if (!userId) {
      return sendResponse({
        res,
        statusCode: StatusCodes.UNAUTHORIZED,
        message: "User not authenticated",
      });
    }

    // Check if 2FA is already enabled
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user?.isTwoFAEnable) {
      return sendResponse({
        res,
        statusCode: StatusCodes.BAD_REQUEST,
        message: "2FA is already enabled for this account",
      });
    }

    // Generate a secret
    const secret = speakeasy.generateSecret({
      name: `Messenger Lite (${user?.username})`,
      length: 20,
    });

    // Encrypt secret before saving
    const encryptedSecret = encrypt(secret.base32);

    await prisma.user.update({
      where: { id: userId },
      data: { twoFASecret: encryptedSecret },
    });

    console.log("2FA secret:", secret, "encryptedSecret:", encryptedSecret);

    // Generate QR code
    const qr = await qrcode.toDataURL(secret.otpauth_url!);

    return sendResponse({
      res,
      statusCode: StatusCodes.OK,
      message: "2FA generated",
      data: {
        qr,
        secret: secret.base32,
      },
    });
  } catch (error: any) {
    console.error(error);
    return sendResponse({
      res,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Failed to generate 2FA",
    });
  }
};

/**
 * Verify 2FA token and enable 2FA for user
 */
export const verify2FASetup = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth.userId;
    const { token } = req.body;

    if (!userId) {
      return sendResponse({
        res,
        statusCode: StatusCodes.UNAUTHORIZED,
        message: "User not authenticated",
      });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.twoFASecret) {
      return sendResponse({
        res,
        statusCode: StatusCodes.BAD_REQUEST,
        message: "2FA not initialized",
      });
    }

    const decryptedSecret = decrypt(user.twoFASecret);

    const verified = speakeasy.totp.verify({
      secret: decryptedSecret,
      encoding: "base32",
      token,
      window: 1, // allow ±1 step
    });
    console.log(verified);
    if (!verified) {
      return sendResponse({
        res,
        statusCode: StatusCodes.BAD_REQUEST,
        message: "Invalid 2FA code",
      });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { isTwoFAEnable: true },
    });

    return sendResponse({
      res,
      statusCode: StatusCodes.OK,
      message: "2FA enabled successfully",
      // data: { user: user },
    });
  } catch (error: any) {
    console.error(error);
    return sendResponse({
      res,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Failed to verify 2FA",
    });
  }
};

export const remove2FA = async (req: Request, res: Response) => {
  const { token } = req.body;

  try {
    const userId = (req as any).auth.userId;
    if (!userId) {
      return sendResponse({
        res,
        statusCode: StatusCodes.UNAUTHORIZED,
        message: "User not authenticated",
      });
    }
    if (token) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user || !user.twoFASecret) {
        return sendResponse({
          res,
          statusCode: StatusCodes.BAD_REQUEST,
          message: "2FA not initialized",
        });
      }

      const decryptedSecret = decrypt(user.twoFASecret);

      const verified = speakeasy.totp.verify({
        secret: decryptedSecret,
        encoding: "base32",
        token,
        window: 1, // allow ±1 step
      });
      console.log(verified);
      if (!verified) {
        return sendResponse({
          res,
          statusCode: StatusCodes.BAD_REQUEST,
          message: "Invalid 2FA code",
        });
      }
    }

    await prisma.user.update({
      where: { id: userId },
      data: { isTwoFAEnable: false, twoFASecret: "", lockedUntil: null },
    });

    return sendResponse({
      res,
      statusCode: StatusCodes.OK,
      message: "2FA removed successfully",
    });
  } catch (error: any) {
    console.error(error);
    return sendResponse({
      res,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Failed to remove 2FA",
    });
  }
};
