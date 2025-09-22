// src/controllers/message/sendMessage.controller.ts
import { MessageType, Prisma, PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import sendResponse from "../../libs/sendResponse";
import type { IOServerWithHelpers } from "../../socket/initSocket";

/** Socket.io room name for a conversation */
const conversationRoom = (conversationId: string) => `conv:${conversationId}`;

/** Expected request body shape */
type SendMessageBody = {
  // If sending to an existing conversation
  conversationId?: string;

  // If starting (or ensuring) a direct message with someone
  recipientId?: string;

  // Message content & metadata
  message?: string;
  messageType?: MessageType; // defaults to TEXT when not provided
  fileUrl?: string;
  fileName?: string;
  fileMime?: string;
  fileSize?: number;

  // Optional: message was forwarded from another id
  forwardedFrom?: string;

  // Optional: client-generated temp id for UI reconciliation
  clientTempId?: string;
};

async function ensureDirectConversation(
  tx: Prisma.TransactionClient,
  meUserId: string,
  peerUserId: string
) {
  // Check if a DIRECT conversation already exists for (me, peer)
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

  // Otherwise, create a new DIRECT conversation with both participants
  return tx.conversation.create({
    data: {
      type: "DIRECT",
      participants: { create: [{ userId: meUserId }, { userId: peerUserId }] },
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
      const userId = (req as any).userId as string; // assumed set by auth middleware

      // Normalize & default body fields
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

      // Do everything in a single DB transaction so it's consistent or rolled back
      const savedMessage = await prisma.$transaction(async (tx) => {
        // -------------------------------------------------------------------
        // 1) Resolve conversation (existing group/direct OR ensure a new direct)
        // -------------------------------------------------------------------
        let conversation =
          conversationId &&
          (await tx.conversation.findUnique({
            where: { id: conversationId },
            select: { id: true, type: true },
          }));

        // If conversation not found:
        // - We allow the client to pass peer user id in conversationId (convIdRaw)
        // - Or pass recipientId explicitly. We then ensure a DIRECT conversation.
        if (!conversation) {
          const peerUserId = recipientId || conversationIdRaw; // tolerate DM peer id in convId slot
          if (!peerUserId) {
            const err: any = new Error(
              "conversationId or recipientId required"
            );
            err.status = StatusCodes.BAD_REQUEST;
            throw err;
          }

          // Sanity check: the peer must exist
          const peerExists = await tx.user.findUnique({
            where: { id: peerUserId },
            select: { id: true },
          });
          if (!peerExists) {
            const err: any = new Error("Recipient not found");
            err.status = StatusCodes.NOT_FOUND;
            throw err;
          }

          // Ensure (or create) a DIRECT conversation with the peer
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

        // -------------------------------------------------------------------
        // 3) Create the message
        // -------------------------------------------------------------------
        const createdMessage = await tx.message.create({
          data: {
            conversationId: conversation.id,
            authorId: userId,
            message: message ?? "", // empty string allowed for pure file message
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

        // -------------------------------------------------------------------
        // 4) Mark the sender's read receipt for their own message
        // -------------------------------------------------------------------
        await tx.messageRead.upsert({
          where: { messageId_userId: { messageId: createdMessage.id, userId } },
          create: { messageId: createdMessage.id, userId },
          update: { readAt: new Date() },
        });

        // Attach the clientTempId back so the client can reconcile optimistic UI
        (createdMessage as any).clientTempId = clientTempId ?? null;

        return createdMessage;
      });

      // ---------------------------------------------------------------------
      // 5) Notify all clients in the conversation room via Socket.io
      // ---------------------------------------------------------------------
      io.to(conversationRoom(savedMessage.conversationId)).emit(
        "receive_message",
        savedMessage
      );

      // Done!
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
