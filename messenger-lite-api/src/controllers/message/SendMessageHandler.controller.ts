// src/controllers/message/SendMessageHandler.controller.ts
import { MessageType, PrismaClient, Prisma } from "@prisma/client";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import sendResponse from "../../libs/sendResponse";
import type { IOServerWithHelpers } from "../../socket/initSocket";

const convRoom = (id: string) => `conv:${id}`;

type Body = {
  conversationId?: string;
  recipientId?: string;
  message?: string;
  messageType?: MessageType; // default TEXT
  fileUrl?: string;
  fileName?: string;
  fileMime?: string;
  fileSize?: number;
  forwardedFrom?: string;
  clientTempId?: string;
};

async function ensureDirectConversation(
  tx: PrismaClient,
  me: string,
  peer: string
) {
  // find if a DIRECT conversation exists for (me, peer)
  const found = await tx.conversation.findFirst({
    where: {
      type: "DIRECT",
      AND: [
        { participants: { some: { userId: me } } },
        { participants: { some: { userId: peer } } },
      ],
    },
    select: { id: true },
  });
  if (found) return found;

  // create if missing
  return tx.conversation.create({
    data: {
      type: "DIRECT",
      participants: { create: [{ userId: me }, { userId: peer }] },
    },
    select: { id: true },
  });
}

export default function SendMessageHandler(
  io: IOServerWithHelpers,
  prisma: PrismaClient
) {
  return async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId as string;
      const {
        conversationId: convIdRaw,
        recipientId: recipientIdRaw,
        message,
        messageType = MessageType.TEXT,
        fileUrl,
        fileName,
        fileMime,
        fileSize,
        forwardedFrom,
        clientTempId,
      } = req.body as Body;

      let conversationId: string | undefined = convIdRaw?.trim() || undefined;
      const recipientId: string | undefined =
        recipientIdRaw?.trim() || undefined;

      const savedMessage = await prisma.$transaction(async (tx) => {
        // 1) Resolve conversationId
        let conv = conversationId
          ? await tx.conversation.findUnique({
              where: { id: conversationId },
              select: { id: true, type: true },
            })
          : null;

        // If no valid conv OR (likely a DM started by peer user id), ensure a DIRECT using recipientId OR convIdRaw
        if (!conv) {
          const peer = recipientId || convIdRaw; // tolerate client sending peer id in conversationId
          if (!peer) {
            throw new Error("conversationId or recipientId required");
          }
          // sanity: peer must be a real user
          const userExists = await tx.user.findUnique({
            where: { id: peer },
            select: { id: true },
          });
          if (!userExists) {
            const err: any = new Error("Recipient not found");
            err.status = StatusCodes.NOT_FOUND;
            throw err;
          }
          const ensured = await ensureDirectConversation(
            tx as unknown as PrismaClient,
            userId,
            peer
          );
          conversationId = ensured.id;
          conv = { id: conversationId, type: "DIRECT" as const };
        }

        // 2) Membership check (for GROUP must be member; for DIRECT ensure already added above)
        const isMember = await tx.conversationParticipant.findFirst({
          where: { conversationId: conv.id, userId },
          select: { id: true },
        });
        if (!isMember) {
          const err: any = new Error("Not a participant");
          err.status = StatusCodes.FORBIDDEN;
          // For DIRECT you could auto-add, but safer to forbid unless using ensure above
          throw err;
        }

        // 3) Create message
        const created = await tx.message.create({
          data: {
            conversationId: conv.id,
            authorId: userId,
            message: message ?? "",
            messageType,
            fileUrl: fileUrl ?? null,
            fileName: fileName ?? null,
            fileMime: fileMime ?? null,
            fileSize: fileSize ?? null,
            forwardedFrom: forwardedFrom ?? null,
          },
          include: {
            author: { select: { id: true, username: true, avatar: true } },
            conversation: { select: { id: true, type: true, name: true } },
            reactions: {
              include: { user: { select: { id: true, username: true } } },
            },
            receipts: {
              include: { user: { select: { id: true, username: true } } },
            },
          },
        });

        // 4) Mark sender read
        await tx.messageRead.upsert({
          where: { messageId_userId: { messageId: created.id, userId } },
          create: { messageId: created.id, userId },
          update: { readAt: new Date() },
        });

        // attach back clientTempId so client can reconcile
        (created as any).clientTempId = clientTempId ?? null;
        return created;
      });

      io.to(convRoom(savedMessage.conversationId)).emit(
        "receive_message",
        savedMessage
      );

      return sendResponse({
        res,
        statusCode: StatusCodes.CREATED,
        message: "Message sent successfully",
        data: savedMessage,
      });
    } catch (e: any) {
      const status = e?.status ?? StatusCodes.INTERNAL_SERVER_ERROR;
      return sendResponse({
        res,
        statusCode: status,
        message: e?.message || "Failed to send message",
        data: null,
      });
    }
  };
}
