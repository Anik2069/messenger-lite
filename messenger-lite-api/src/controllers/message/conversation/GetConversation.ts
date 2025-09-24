import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { IOServerWithHelpers } from "../../../socket/initSocket";
import sendResponse from "../../../libs/sendResponse";

export default function getConversations(
  io: IOServerWithHelpers,
  prisma: PrismaClient
) {
  return async (req: Request, res: Response) => {
    const userId = (req as any).userId as string;

    try {
      const conversations = await prisma.conversation.findMany({
        where: {
          participants: {
            some: {
              userId,
            },
          },
        },
        include: {
          participants: {
            select: {
              user: {
                select: {
                  id: true,
                  username: true,
                  avatar: true,
                },
              },
            },
          },
          messages: {
            orderBy: {
              createdAt: "desc",
            },
            take: 1,
          },
        },
      });

      console.log("Fetched conversations for user:", userId, conversations);

      return sendResponse({
        res,
        statusCode: StatusCodes.OK,
        message: "Fetched conversations successfully",
        data: conversations,
      });
    } catch (error) {
      console.error("Error fetching conversations:", error);
      return sendResponse({
        res,
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Failed to fetch conversations",
        data: [],
      });
    }
  };
}
