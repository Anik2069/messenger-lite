import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import sendResponse from "../../libs/sendResponse";
import type { IOServerWithHelpers } from "../../socket/initSocket";

const convRoomM = (id: string) => `conv:${id}`;

export default function MarkRead(
  io: IOServerWithHelpers,
  prisma: PrismaClient
) {
  return async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId as string;
      const { messageId } = req.params as { messageId: string };

      const msg = await prisma.message.findUnique({
        where: { id: messageId },
        select: { id: true, conversationId: true },
      });
      if (!msg) {
        return sendResponse({
          res,
          statusCode: StatusCodes.NOT_FOUND,
          message: "Message not found",
          data: null,
        });
      }

      const member = await prisma.conversationParticipant.findFirst({
        where: { conversationId: msg.conversationId, userId },
        select: { id: true },
      });
      if (!member)
        return sendResponse({
          res,
          statusCode: StatusCodes.FORBIDDEN,
          message: "Not a participant",
          data: null,
        });

      const receipt = await prisma.messageRead.upsert({
        where: { messageId_userId: { messageId, userId } },
        create: { messageId, userId },
        update: { readAt: new Date() },
      });

      const payload = { messageId, userId, readAt: receipt.readAt };
      io.of("/chat").to(convRoomM(msg.conversationId)).emit("message_read", payload);

      return sendResponse({
        res,
        statusCode: StatusCodes.OK,
        message: "Marked read successfully",
        data: payload,
      });
    } catch (e: any) {
      return sendResponse({
        res,
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        message: e?.message || "Failed to mark read",
      });
    }
  };
}
