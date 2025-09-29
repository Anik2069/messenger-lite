import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import sendResponse from "../../libs/sendResponse";
import { prisma } from "../../configs/prisma.config";

export const FriendsList = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const search = req.query.search as string | undefined;
    const userId = (req as any).userId;

    // 1. Get all accepted friendships
    const friends = await prisma.friendRequest.findMany({
      where: {
        status: "ACCEPTED",
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      include: {
        sender: true,
        receiver: true,
      },
    });

    // 2. Map to actual friend (not self)
    let friendsList = friends.map((f) =>
      f.senderId === userId ? f.receiver : f.sender
    );

    // 3. Optional search filter
    if (search) {
      friendsList = friendsList.filter((u) =>
        u.username.toLowerCase().includes(search.toLowerCase())
      );
    }

    return sendResponse({
      res,
      statusCode: StatusCodes.OK,
      message: "User friends list fetched successfully",
      data: friendsList,
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
