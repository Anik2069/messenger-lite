import { prisma } from "../../../configs/prisma.config";
import { StatusCodes } from "http-status-codes";
import { Request, Response } from "express";
import sendResponse from "../../../libs/sendResponse";
import { compare, hash } from "bcrypt";
import bcrypt from "bcrypt";
const SALT_ROUNDS = Number(process.env.SALT_ROUNDS || 10);
export const updatePassword = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth?.userId;
    if (!userId) {
      return sendResponse({
        res,
        statusCode: StatusCodes.BAD_REQUEST,
        message: "User not authenticated",
      });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return sendResponse({
        res,
        statusCode: StatusCodes.NOT_FOUND,
        message: "User not found",
      });
    }

    const { currentPassword, newPassword } = req.body;

    const ok = await bcrypt.compare(currentPassword, user.password);
    if (!ok) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Invalid password" });
    }

    const hashed = await bcrypt.hash(newPassword, SALT_ROUNDS);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashed },
    });

    return sendResponse({
      res,
      statusCode: StatusCodes.OK,
      message: "Password updated successfully",
    });
  } catch (error: any) {
    console.error(error);
    return sendResponse({
      res,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Internal server error",
    });
  }
};
