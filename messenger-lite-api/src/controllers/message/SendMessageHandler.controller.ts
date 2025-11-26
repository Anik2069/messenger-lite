// src/controllers/message/sendMessage.controller.ts
import { MessageType, Prisma, PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import sendResponse from "../../libs/sendResponse";
import type { IOServerWithHelpers } from "../../socket/initSocket";

const conversationRoom = (conversationId: string) => `conv:${conversationId}`;


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
        messageType,
        clientTempId,
      } = req.body as any;
      console.log(req.body, "req.body in send message");
      // Files uploaded via multer
      const files = req.files as Express.Multer.File[] | undefined;
      console.log(files, "llllllllllllllllllllllllllll");

      let conversationId: string | undefined =
        conversationIdRaw?.trim() || undefined;
      const recipientId: string | undefined =
        recipientIdRaw?.trim() || undefined;

      const createdMessages = await prisma.$transaction(async (tx) => {
        // Fetch conversation
        let conversation =
          conversationId &&
          (await tx.conversation.findUnique({
            where: { id: conversationId },
            select: { id: true, type: true },
          }));

        // If conversation does not exist, create direct conversation
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

        // Check participant
        const membership = await tx.conversationParticipant.findFirst({
          where: { conversationId: conversation.id, userId },
          select: { id: true },
        });
        if (!membership) {
          const err: any = new Error("Not a participant");
          err.status = StatusCodes.FORBIDDEN;
          throw err;
        }

        const messagesToCreate: any[] = [];

        // If files exist, create one message per file
        if (files?.length) {
          for (const file of files) {
            // console.log(file);

            messagesToCreate.push(
              tx.message.create({
                data: {
                  conversationId: conversation.id,
                  authorId: userId,
                  message: message || file.originalname,
                  messageType: messageType,
                  fileUrl: `/uploads/${file.filename}`,
                  fileName: file.originalname,
                  fileMime: file.mimetype,
                  fileSize: file.size,
                },
                include: {
                  author: {
                    select: { id: true, username: true, avatar: true },
                  },
                  conversation: {
                    select: { id: true, type: true, name: true },
                  },
                  reactions: {
                    include: { user: { select: { id: true, username: true } } },
                  },
                  receipts: {
                    include: { user: { select: { id: true, username: true } } },
                  },
                },
              })
            );
          }
        } else {
          console.log(message, "text");
          // Text-only message
          messagesToCreate.push(
            tx.message.create({
              data: {
                conversationId: conversation.id,
                authorId: userId,
                message: message || "",
                messageType,
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
            })
          );
        }

        const createdMessages = await Promise.all(messagesToCreate);

        // Upsert message reads and update conversation.updatedAt
        for (const msg of createdMessages) {
          await tx.messageRead.upsert({
            where: { messageId_userId: { messageId: msg.id, userId } },
            create: { messageId: msg.id, userId },
            update: { readAt: new Date() },
          });
        }

        await tx.conversation.update({
          where: { id: conversation.id },
          data: { updatedAt: new Date() },
        });

        return createdMessages.map((m) => ({
          ...m,
          clientTempId: clientTempId ?? null,
        }));
      });

      // Broadcast messages to conversation room
      for (const msg of createdMessages) {
        io.to(conversationRoom(msg.conversationId)).emit(
          "receive_message",
          msg
        );
      }

      // Update conversation lists for all participants
      const participants = await prisma.conversationParticipant.findMany({
        where: { conversationId: createdMessages[0].conversationId },
        select: { userId: true },
      });

      for (const p of participants) {
        const updatedList = await getUserConversationsSorted(prisma, p.userId);
        io.to(p.userId).emit("conversations_updated", updatedList);
      }

      // Join only the message sender to the conversation room (if they have an active socket)
      const senderSocket = io.sockets.sockets.get(userId);
      if (senderSocket) {
        const roomName = conversationRoom(createdMessages[0].conversationId);
        senderSocket.join(roomName);
        console.log(
          `Joined sender ${userId} to conversation room ${roomName}`
        );
      }

      return sendResponse({
        res,
        statusCode: StatusCodes.CREATED,
        message: "Message(s) sent successfully",
        data:
          createdMessages.length === 1 ? createdMessages[0] : createdMessages,
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
