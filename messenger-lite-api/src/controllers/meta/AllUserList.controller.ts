import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import sendResponse from "../../libs/sendResponse";
import { prisma } from "../../configs/prisma.config";

export const AllUserList = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const search = req.query.search as string | undefined;
    const userId = (req as any).userId as string;
    const friendsList = await prisma.user.findMany({
      where: search
        ? {
            id: { not: userId },
            username: {
              contains: search,
              mode: "insensitive",
            },
          }
        : {
            id: {
              not: userId,
            },
          },

      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
        isOnline: true,
        createdAt: true,
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    return sendResponse({
      res,
      statusCode: StatusCodes.OK,
      message: "User friends List",
      data: { friendsList },
    });
  } catch (error) {
    console.error("Friends list error:", error);

    return sendResponse({
      res,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Internal server error while fetching friends list",
      data: null,
    });
  }
};
