import { MessageType, Prisma, PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import sendResponse from "../../libs/sendResponse";
import type { IOServerWithHelpers } from "../../socket/initSocket";

const convRoom = (id: string) => `conv:${id}`;

type Body = {
  conversationId: string;
  message?: string;
  messageType?: MessageType;
  fileUrl?: string;
  fileName?: string;
  fileMime?: string;
  fileSize?: number;
  forwardedFrom?: string;
};

export default function SendMessageHandler(
  io: IOServerWithHelpers,
  prisma: PrismaClient
) {
  return async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId as string;
      const {
        conversationId,
        message,
        messageType = MessageType.TEXT,
        fileUrl,
        fileName,
        fileMime,
        fileSize,
        forwardedFrom,
      } = req.body as Body;

      // ensure membership
      const isMember = await prisma.conversationParticipant.findFirst({
        where: { conversationId, userId },
        select: { id: true },
      });
      if (!isMember)
        return sendResponse({
          res,
          statusCode: StatusCodes.FORBIDDEN,
          message: "Not a participant",
          data: null,
        });

      const savedMessage = await prisma.$transaction(async (tx) => {
        const data: Prisma.MessageUncheckedCreateInput = {
          conversationId,
          authorId: userId,
          message: message ?? "",
          messageType, // enum ok
          fileUrl: fileUrl ?? null, // <-
          fileName: fileName ?? null, // <-
          fileMime: fileMime ?? null, // <-
          fileSize: fileSize ?? null, // <-
          forwardedFrom: forwardedFrom ?? null, // <-
        };
        const created = await tx.message.create({
          data,
          include: {
            author: { select: { id: true, username: true, avatar: true } },
            reactions: true,
            receipts: true,
          },
        });
        // mark sender as read
        await tx.messageRead.upsert({
          where: { messageId_userId: { messageId: created.id, userId } },
          create: { messageId: created.id, userId },
          update: { readAt: new Date() },
        });

        return created;
      });

      io.to(convRoom(conversationId)).emit("receive_message", savedMessage);

      return sendResponse({
        res,
        statusCode: StatusCodes.CREATED,
        message: "Message sent successfully",
        data: savedMessage,
      });
    } catch (e: any) {
      return sendResponse({
        res,
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        message: e?.message || "Failed to send message",
        data: null,
      });
    }
  };
}
