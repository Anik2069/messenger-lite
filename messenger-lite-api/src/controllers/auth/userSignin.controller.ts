import bcrypt from "bcrypt";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";
import { prisma } from "../../configs/prisma.config";
import getAccessToken from "../../helpers/getAccessToken";
import sendResponse from "../../libs/sendResponse";
import jwt from "jsonwebtoken";

// Validation Schema
const userSigninDto = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const userSignin = async (req: any, res: any) => {
  try {
    const { email, password } = userSigninDto.parse(req.body);

    const user = await prisma.user.findFirst({
      where: { email },
    });

    if (!user) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "User not found",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: "Invalid password",
      });
    }

    const accessToken = getAccessToken({ email }, "24h");

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    await prisma.user.update({
      where: { email },
      data: { isOnline: true },
    });

    const userInfo = await prisma.user.findUnique({
      where: { email },
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
      data: { userInfo, accessToken },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Validation Error",
        errors: error.issues,
      });
    }

    console.error("Signin error:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Internal server error",
    });
  }
};

export { userSignin };
