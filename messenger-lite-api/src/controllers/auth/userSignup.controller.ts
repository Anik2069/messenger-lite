// src/controllers/auth/userSignup.controller.ts
import bcrypt from "bcrypt";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";
import { prisma } from "../../configs/prisma.config";
import sendResponse from "../../libs/sendResponse";
import getAccessToken from "../../helpers/getAccessToken";
import type { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { initSocket } from "../../socket copy";
import { IOServerWithHelpers } from "../../socket/initSocket";

const SALT_ROUNDS = Number(process.env.SALT_ROUNDS || 10);

const userSignupDto = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be at most 30 characters")
    .regex(
      /^[a-zA-Z0-9_.]+$/,
      "Username can contain letters, numbers, _ and . only"
    ),
  email: z.string().trim().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const userSignup = (io: IOServerWithHelpers) => {
  return async (req: Request, res: Response) => {
    try {
      const parsed = userSignupDto.parse(req.body);
      const username = parsed.username;
      const email = parsed.email.toLowerCase();
      const password = parsed.password;

      const existing = await prisma.user.findFirst({
        where: { OR: [{ email }, { username }] },
        select: { id: true, email: true, username: true },
      });
      if (existing) {
        return sendResponse({
          res,
          statusCode: StatusCodes.CONFLICT,
          message: "User already exists with this email or username",
          data: null,
        });
      }

      const hashed = await bcrypt.hash(password, SALT_ROUNDS);
      const user = await prisma.user.create({
        data: {
          username,
          email,
          password: hashed,
          isOnline: true,
        },
        select: {
          id: true,
          username: true,
          email: true,
          isOnline: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      const accessToken = getAccessToken({ id: user.id }, "24h");
      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000,
      });
      io.emit("user:created", { id: user.id, newUser: true });
      return sendResponse({
        res,
        statusCode: StatusCodes.CREATED,
        message: "User created successfully",
        data: { userInfo: user, accessToken },
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return sendResponse({
          res,
          statusCode: StatusCodes.BAD_REQUEST,
          message: "Validation Error",
          data: error.issues,
        });
      }
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        return sendResponse({
          res,
          statusCode: StatusCodes.CONFLICT,
          message: "User already exists with this email or username",
          data: null,
        });
      }

      console.error("Signup error:", error);
      return sendResponse({
        res,
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Internal server error",
        data: null,
      });
    }
  };
};

export { userSignup };
