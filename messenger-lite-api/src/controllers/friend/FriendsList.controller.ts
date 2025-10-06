import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import sendResponse from "../../libs/sendResponse";
import { prisma } from "../../configs/prisma.config";
import { FriendStatus } from "@prisma/client";

export const FriendsList = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const search = (req.query.search as string) || "";
    const userId = (req as any).userId;
    const status = (req.query.status as FriendStatus) || "ACCEPTED";

    if (status === "PENDING") {
      //  Fetch only requests where *you are the receiver* (i.e., others sent you a request)
      const incomingRequests = await prisma.friendRequest.findMany({
        where: {
          receiverId: userId,
          status: "PENDING",
          sender: {
            username: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
        include: {
          sender: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      const users = incomingRequests.map((req) => ({
        id: req.sender.id,
        username: req.sender.username,
        email: req.sender.email,
        avatar: req.sender.avatar,
        isOnline: req.sender.isOnline,
        requestCreatedAt: req.createdAt,
        requestUpdatedAt: req.updatedAt,
      }));

      return sendResponse({
        res,
        statusCode: StatusCodes.OK,
        message: "Users who sent you friend requests fetched successfully",
        data: users,
      });
    }

    //  Default: accepted friends list
    const acceptedFriends = await prisma.friendRequest.findMany({
      where: {
        status: "ACCEPTED",
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      include: {
        sender: true,
        receiver: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const friendsList = acceptedFriends.map((f) =>
      f.senderId === userId ? f.receiver : f.sender
    );

    const filteredFriends = friendsList.filter((u) =>
      u.username.toLowerCase().includes(search.toLowerCase())
    );

    return sendResponse({
      res,
      statusCode: StatusCodes.OK,
      message: "Friends list fetched successfully",
      data: filteredFriends,
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
