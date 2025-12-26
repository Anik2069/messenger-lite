import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { IOServerWithHelpers } from "../../../socket/initSocket";
import sendResponse from "../../../libs/sendResponse";

export function getConversations(
  io: IOServerWithHelpers,
  prisma: PrismaClient
) {
  return async (req: Request, res: Response) => {
    const userId = (req as any).userId as string;

    const { search } = req.query || {};

    try {
      const searchTerm = typeof search === "string" ? search : "";

      const conversations = await prisma.conversation.findMany({
        where: {
          AND: [
            {
              participants: {
                some: {
                  userId,
                  user: {
                    username: {
                      contains: searchTerm,
                      mode: "insensitive",
                    },
                  },
                },
              },
            },
          ],
        },
        include: {
          participants: {
            include: {
              user: true,
            },
          },
          messages: {
            orderBy: {
              createdAt: "desc",
            },
            include: {
              author: {
                select: {
                  id: true,
                  username: true,
                  avatar: true,
                },
              },
            },
            take: 1,
          },
        },
        orderBy: {
          updatedAt: "desc",
        },
      });

      const conversationWithVerifiedMessages = conversations.map((conversation) => {
        const participant = conversation.participants.find(
          (p) => p.userId === userId
        );

        if (participant?.clearedAt && conversation.messages.length > 0) {
          const filteredMessages = conversation.messages.filter(
            (msg) => msg.createdAt > participant.clearedAt!
          );
          return {
            ...conversation,
            messages: filteredMessages,
          };
        }
        return conversation;
      });

      return sendResponse({
        res,
        statusCode: StatusCodes.OK,
        message: "Fetched conversations successfully",
        data: conversationWithVerifiedMessages,
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
