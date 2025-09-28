import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import sendResponse from "../../../libs/sendResponse";
import { PrismaClient } from "@prisma/client";

export default function getMessagesController(prisma: PrismaClient) {
  return async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId as string;
      const { conversationId: param } = req.params;

      if (!param) {
        return sendResponse({
          res,
          statusCode: StatusCodes.BAD_REQUEST,
          message: "conversationId is required",
          data: [],
        });
      }

      let conversation = await prisma.conversation.findFirst({
        where: {
          id: param,
          participants: { some: { userId } },
        },
        include: { participants: true },
      });

      // If not found, treat param as peer userId (for DIRECT chat)
      if (!conversation) {
        const peerUserId = param;

        conversation = await prisma.conversation.findFirst({
          where: {
            type: "DIRECT",
            participants: {
              some: { userId },
            },
            AND: {
              participants: { some: { userId: peerUserId } },
            },
          },
          include: { participants: true },
        });

        // If still not found → create a new direct conversation
        if (!conversation) {
          // conversation = await prisma.conversation.create({
          //   data: {
          //     type: "DIRECT",
          //     participants: {
          //       create: [{ userId }, { userId: peerUserId }],
          //     },
          //   },
          //   include: { participants: true },
          // });
        }
      }

      if (!conversation) {
        return sendResponse({
          res,
          statusCode: StatusCodes.OK,
          message: "Not a participant",
          data: [],
        });
      }

      // Fetch messages for the resolved conversation
      const messages = await prisma.message.findMany({
        where: { conversationId: conversation.id },
        include: {
          author: { select: { id: true, username: true, avatar: true } },
          reactions: { include: { user: true } },
          receipts: { include: { user: true } },
        },
        orderBy: { createdAt: "asc" },
      });

      const normalized = messages.map((m) => ({
        ...m,
        author: { ...m.author, id: String(m.author.id) },
      }));

      return sendResponse({
        res,
        statusCode: StatusCodes.OK,
        message: "Messages fetched",
        data: normalized,
      });
    } catch (err) {
      console.error(err);
      return sendResponse({
        res,
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Failed to fetch messages",
        data: [],
      });
    }
  };
}
