import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import sendResponse from "../../libs/sendResponse";
import type { IOServerWithHelpers } from "../../socket/initSocket";

const convRoomR = (id: string) => `conv:${id}`;

export default function ToggleReaction(
  io: IOServerWithHelpers,
  prisma: PrismaClient
) {
  return async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId as string;
      const { messageId } = req.params as { messageId: string };
      const { emoji } = req.body as { emoji: string };

      const msg = await prisma.message.findUnique({
        where: { id: messageId },
        select: { id: true, conversationId: true },
      });
      if (!msg)
        return sendResponse({
          res,
          statusCode: StatusCodes.NOT_FOUND,
          message: "Message not found",
          data: null,
        });

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

      const key = {
        messageId_userId_emoji: { messageId, userId, emoji },
      } as const;
      const exists = await prisma.messageReaction.findUnique({ where: key });

      let action: "added" | "removed";
      if (exists) {
        await prisma.messageReaction.delete({ where: key });
        action = "removed";
      } else {
        await prisma.messageReaction.create({
          data: { messageId, userId, emoji },
        });
        action = "added";
      }

      const payload = { messageId, userId, emoji, action };
      io.to(convRoomR(msg.conversationId)).emit("message_reaction", payload);

      return sendResponse({
        res,
        statusCode: StatusCodes.OK,
        message: "Reaction toggled successfully",
        data: payload,
      });
    } catch (e: any) {
      return sendResponse({
        res,
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        message: e?.message || "Failed to toggle reaction",
        data: null,
      });
    }
  };
}
