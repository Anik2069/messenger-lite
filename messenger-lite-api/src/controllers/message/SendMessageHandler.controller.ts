// src/controllers/messages/SendMessageHandler.ts

import { StatusCodes } from "http-status-codes";
import sendResponse from "../../libs/sendResponse";
import { MessageType, PrismaClient } from "@prisma/client";
import type { Server as SocketIOServer } from "socket.io";
import type { Request, Response, NextFunction } from "express";

type Body = {
  authorId: string;
  text: string;
  type?: "TEXT" | "FILE" | "FORWARDED" | "text" | "file" | "forwarded";
  recipientId?: string;
  conversationId?: string;
  fileData?: { url: string; filename: string; mimetype: string; size: number };
  forwardedFrom?: string;
  clientTempId?: string;
};

const normalizeMessageType = (type?: Body["type"]): MessageType => {
  const norm = String(type ?? "TEXT").toUpperCase();
  return (
    ["TEXT", "FILE", "FORWARDED"].includes(norm) ? norm : "TEXT"
  ) as MessageType;
};

const createOrGetDirectConversation = async (
  prisma: PrismaClient,
  aId: string,
  bId: string
) => {
  const existing = await prisma.conversation.findFirst({
    where: {
      type: "DIRECT",
      AND: [
        { participants: { some: { userId: aId } } },
        { participants: { some: { userId: bId } } },
      ],
    },
    include: { participants: { include: { user: true } } },
  });
  if (existing) return existing;

  const participantIds = [...new Set([aId, bId])];

  return prisma.conversation.create({
    data: {
      type: "DIRECT",
      participants: {
        create: participantIds.map((uid) => ({
          user: { connect: { id: uid } },
        })),
      },
    },
    include: { participants: { include: { user: true } } },
  });
};

const BLOCK_SELF_DM = false;

const SendMessageHandler =
  (io: SocketIOServer, prisma: PrismaClient) =>
  async (req: Request<{}, {}, Body>, res: Response, _next: NextFunction) => {
    try {
      const {
        authorId,
        text,
        type,
        recipientId,
        conversationId,
        fileData,
        forwardedFrom,
        clientTempId,
      } = req.body;

      if (!authorId || !text) {
        return sendResponse({
          res,
          statusCode: StatusCodes.BAD_REQUEST,
          message: "authorId and text are required",
          data: null,
        });
      }

      const author = await prisma.user.findUnique({ where: { id: authorId } });
      if (!author) {
        return sendResponse({
          res,
          statusCode: StatusCodes.BAD_REQUEST,
          message: "Invalid authorId: user not found",
          data: null,
        });
      }

      const messageType = normalizeMessageType(type);

      let convo =
        (conversationId &&
          (await prisma.conversation.findUnique({
            where: { id: conversationId },
            include: { participants: { include: { user: true } } },
          }))) ||
        null;

      if (!convo && conversationId) {
        const maybeUser = await prisma.user.findUnique({
          where: { id: conversationId },
        });

        if (maybeUser) {
          const peerId = maybeUser.id;

          if (BLOCK_SELF_DM && peerId === authorId) {
            return sendResponse({
              res,
              statusCode: StatusCodes.BAD_REQUEST,
              message: "Cannot start a DIRECT conversation with yourself",
              data: null,
            });
          }

          convo = await createOrGetDirectConversation(prisma, authorId, peerId);
        }
      }

      if (!convo && recipientId) {
        const recipient = await prisma.user.findUnique({
          where: { id: recipientId },
        });
        if (!recipient) {
          return sendResponse({
            res,
            statusCode: StatusCodes.BAD_REQUEST,
            message:
              "Invalid recipientId: user not found. Send a valid conversationId or recipientId.",
            data: null,
          });
        }

        if (BLOCK_SELF_DM && recipientId === authorId) {
          return sendResponse({
            res,
            statusCode: StatusCodes.BAD_REQUEST,
            message: "Cannot start a DIRECT conversation with yourself",
            data: null,
          });
        }

        convo = await createOrGetDirectConversation(
          prisma,
          authorId,
          recipientId
        );
      }

      if (!convo) {
        return sendResponse({
          res,
          statusCode: StatusCodes.BAD_REQUEST,
          message:
            "Invalid conversationId: conversation not found. Provide a valid conversationId or a recipientId.",
          data: null,
        });
      }

      const isParticipant = convo.participants.some(
        (p) => p.userId === authorId
      );
      if (!isParticipant) {
        return sendResponse({
          res,
          statusCode: StatusCodes.FORBIDDEN,
          message: "You are not a participant of this conversation",
          data: null,
        });
      }

      const createData = {
        conversationId: convo.id,
        authorId,
        message: text,
        messageType,
        ...(fileData && {
          fileUrl: fileData.url,
          fileName: fileData.filename,
          fileMime: fileData.mimetype,
          fileSize: fileData.size,
        }),
        ...(forwardedFrom ? { forwardedFrom } : {}),
      } as const;

      const message = await prisma.message.create({
        data: createData,
        include: {
          author: true,
          conversation: {
            include: { participants: { include: { user: true } } },
          },
          reactions: true,
          receipts: true,
        },
      });

      const isDirect = message.conversation.type === "DIRECT";
      const participantsUsers = message.conversation.participants.map(
        (p) => p.user
      );
      const other = isDirect
        ? participantsUsers.length === 1
          ? participantsUsers[0]
          : participantsUsers.find((u) => u.id !== authorId) ??
            participantsUsers[0]
        : undefined;

      const payload = {
        id: message.id,
        clientTempId,
        conversationId: message.conversation.id,
        conversationType: message.conversation.type,
        from: { id: message.authorId, username: message.author.username },
        to:
          isDirect && other
            ? { id: other.id, username: other.username }
            : {
                id: message.conversation.id,
                username: message.conversation.name ?? "Group",
              },
        message: message.message,
        messageType: message.messageType.toLowerCase() as
          | "text"
          | "file"
          | "forwarded",
        fileData: message.fileUrl
          ? {
              filename: message.fileName!,
              originalName: message.fileName!,
              size: message.fileSize!,
              mimetype: message.fileMime!,
              url: message.fileUrl!,
            }
          : undefined,
        forwardedFrom: message.forwardedFrom
          ? {
              originalSender: message.forwardedFrom,
              originalTimestamp: message.createdAt,
            }
          : undefined,
        isGroupMessage: message.conversation.type === "GROUP",
        timestamp: message.createdAt,
        reactions: [],
        readBy: [],
      };

      const participantIds = message.conversation.participants.map(
        (p) => p.userId
      );
      participantIds.forEach((uid) =>
        io.to(uid).emit("receive_message", payload)
      );

      return sendResponse({
        res,
        statusCode: StatusCodes.CREATED,
        message: "Message sent",
        data: { message: payload },
      });
    } catch (error) {
      console.error(error);
      return sendResponse({
        res,
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Internal server error",
        data: null,
      });
    }
  };

export default SendMessageHandler;
