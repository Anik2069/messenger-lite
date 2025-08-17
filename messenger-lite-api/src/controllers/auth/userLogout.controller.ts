import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import sendResponse from "../../libs/sendResponse";
import jwt from "jsonwebtoken";
import { prisma } from "../../configs/prisma.config";
import { getEmailFromTokenMiddleware } from "../../helpers/getEmailFromToken";

export const userLogout = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const emailOrResponse = getEmailFromTokenMiddleware(req, res);

    if (typeof emailOrResponse !== "string") {
      return emailOrResponse;
    }

    const email = emailOrResponse;
    console.log(email, "email logout");

    await prisma.user.update({
      where: { email: email },
      data: { isOnline: false },
    });

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
