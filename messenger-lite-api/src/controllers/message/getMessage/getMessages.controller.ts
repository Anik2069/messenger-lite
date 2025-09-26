import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import sendResponse from "../../../libs/sendResponse";
import { PrismaClient } from "@prisma/client";

export default function getMessagesController(prisma: PrismaClient) {
  return async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId as string;
      const { conversationId } = req.params;

      if (!conversationId) {
        throw new Error("conversationId is required");
      }
      const membership = await prisma.conversationParticipant.findFirst({
        where: { conversationId, userId },
      });
      if (!membership) {
        return sendResponse({
          res,
          statusCode: StatusCodes.FORBIDDEN,
          message: "Not a participant",
          data: [],
        });
      }

      const messages = await prisma.message.findMany({
        where: { conversationId },
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
