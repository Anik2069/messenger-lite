import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import sendResponse from "../../libs/sendResponse";
import { prisma } from "../../configs/prisma.config";

export const GetSuggestedFriends = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const userId = (req as any).userId;
    const search = req.query.search as string | undefined;

    // Fetch all users that:
    // - are not current user
    // - have no friendRequest record with current user (as sender or receiver)
    const users = await prisma.user.findMany({
      where: {
        id: { not: userId },
        AND: [
          {
            receivedFriendRequests: {
              none: {
                senderId: userId,
                status: { in: ["PENDING", "ACCEPTED"] },
              },
            },
          },
          {
            sentFriendRequests: {
              none: {
                receiverId: userId,
                status: { in: ["PENDING", "ACCEPTED"] },
              },
            },
          },
        ],
        ...(search && {
          username: { contains: search, mode: "insensitive" },
        }),
      },
      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
        isOnline: true,
        createdAt: true,
      },
      orderBy: { username: "asc" },
    });

    return sendResponse({
      res,
      statusCode: StatusCodes.OK,
      message: "Suggested users fetched successfully",
      data: users,
    });
  } catch (error) {
    console.error("GetSuggestedFriends error:", error);
    return sendResponse({
      res,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Failed to fetch suggested friends",
      data: null,
    });
  }
};
