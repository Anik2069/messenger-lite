// src/controllers/message/sendMessage.controller.ts
import { MessageType, Prisma, PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import sendResponse from "../../libs/sendResponse";
import type { IOServerWithHelpers } from "../../socket/initSocket";

const conversationRoom = (conversationId: string) => `conv:${conversationId}`;

type SendMessageBody = {
  conversationId?: string;
  recipientId?: string;
  message?: string;
  messageType?: MessageType;
  fileUrl?: string;
  fileName?: string;
  fileMime?: string;
  fileSize?: number;
  forwardedFrom?: string;
  clientTempId?: string;
};

// helper: sorted conversation list for a user
export async function getUserConversationsSorted(
  prisma: PrismaClient | Prisma.TransactionClient,
  userId: string
) {
  return prisma.conversation.findMany({
    where: {
      participants: { some: { userId } },
    },
    include: {
      participants: {
        where: { userId: { not: userId } },
        select: { user: true },
      },
      messages: {
        orderBy: { createdAt: "desc" },
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
    orderBy: { updatedAt: "desc" },
  });
}

async function ensureDirectConversation(
  tx: Prisma.TransactionClient,
  meUserId: string,
  peerUserId: string
) {
  const existing = await tx.conversation.findFirst({
    where: {
      type: "DIRECT",
      AND: [
        { participants: { some: { userId: meUserId } } },
        { participants: { some: { userId: peerUserId } } },
      ],
    },
    select: { id: true },
  });
  if (existing) return existing;

  const userMe = await tx.user.findUnique({
    where: { id: meUserId },
    select: { username: true },
  });
  const peerUser = await tx.user.findUnique({
    where: { id: peerUserId },
    select: { username: true },
  });

  return tx.conversation.create({
    data: {
      type: "DIRECT",
      name: `${peerUser?.username} & ${userMe?.username}`,
      participants: {
        create: [{ userId: meUserId }, { userId: peerUserId }],
      },
    },
    select: { id: true },
  });
}

export default function createSendMessageController(
  io: IOServerWithHelpers,
  prisma: PrismaClient
) {
  return async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId as string;

      const {
        conversationId: conversationIdRaw,
        recipientId: recipientIdRaw,
        message,
        messageType = MessageType.TEXT,
        fileUrl,
        fileName,
        fileMime,
        fileSize,
        forwardedFrom,
        clientTempId,
      } = (req.body || {}) as SendMessageBody;

      let conversationId: string | undefined =
        conversationIdRaw?.trim() || undefined;
      const recipientId: string | undefined =
        recipientIdRaw?.trim() || undefined;

      // save message
      const savedMessage = await prisma.$transaction(async (tx) => {
        let conversation =
          conversationId &&
          (await tx.conversation.findUnique({
            where: { id: conversationId },
            select: { id: true, type: true },
          }));

        if (!conversation) {
          const peerUserId = recipientId || conversationIdRaw;
          if (!peerUserId) {
            const err: any = new Error(
              "conversationId or recipientId required"
            );
            err.status = StatusCodes.BAD_REQUEST;
            throw err;
          }

          const peerExists = await tx.user.findUnique({
            where: { id: peerUserId },
            select: { id: true },
          });
          if (!peerExists) {
            const err: any = new Error("Recipient not found");
            err.status = StatusCodes.NOT_FOUND;
            throw err;
          }

          const ensured = await ensureDirectConversation(
            tx,
            userId,
            peerUserId
          );
          conversationId = ensured.id;
          conversation = { id: ensured.id, type: "DIRECT" as const };
        }

        const membership = await tx.conversationParticipant.findFirst({
          where: { conversationId: conversation.id, userId },
          select: { id: true },
        });
        if (!membership) {
          const err: any = new Error("Not a participant");
          err.status = StatusCodes.FORBIDDEN;
          throw err;
        }

        const createdMessage = await tx.message.create({
          data: {
            conversationId: conversation.id,
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

        await tx.messageRead.upsert({
          where: { messageId_userId: { messageId: createdMessage.id, userId } },
          create: { messageId: createdMessage.id, userId },
          update: { readAt: new Date() },
        });

        (createdMessage as any).clientTempId = clientTempId ?? null;

        // update conversation.updatedAt
        await tx.conversation.update({
          where: { id: conversation.id },
          data: { updatedAt: new Date() },
        });

        return createdMessage;
      });

      // broadcast to conversation room
      io.to(conversationRoom(savedMessage.conversationId)).emit(
        "receive_message",
        savedMessage
      );

      // now push updated conversation list to each participant’s personal room
      const participants = await prisma.conversationParticipant.findMany({
        where: { conversationId: savedMessage.conversationId },
        select: { userId: true },
      });

      for (const p of participants) {
        const updatedList = await getUserConversationsSorted(prisma, p.userId);
        io.to(p.userId).emit("conversations_updated", updatedList);
      }

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
