import { StatusCodes } from "http-status-codes";
import sendResponse from "../../libs/sendResponse";
import { MessageType, PrismaClient } from "@prisma/client";
import type { Server as SocketIOServer } from "socket.io";
import type { Request, Response, NextFunction } from "express";

const SendMessageHandler =
  (io: SocketIOServer, prisma: PrismaClient) =>
  async (req: Request, res: Response, _next: NextFunction) => {
    try {
      const {
        authorId,
        text,
        type = "TEXT",
        recipientId,
        conversationId,
        fileData,
        forwardedFrom,
      } = req.body as {
        authorId: string;
        text: string;
        type?: "TEXT" | "FILE" | "FORWARDED" | "text" | "file" | "forwarded";
        recipientId?: string;
        conversationId?: string;
        fileData?: {
          url: string;
          filename: string;
          mimetype: string;
          size: number;
        };
        forwardedFrom?: string;
      };

      if (!authorId || !text) {
        return sendResponse({
          res,
          statusCode: StatusCodes.BAD_REQUEST,
          message: "authorId and text are required",
          data: null,
        });
      }

      const normType = String(type).toUpperCase();
      const messageType: MessageType = (
        ["TEXT", "FILE", "FORWARDED"].includes(normType) ? normType : "TEXT"
      ) as MessageType;

      // Resolve or create DIRECT conversation
      let convoId = conversationId;
      if (!convoId && recipientId) {
        const direct = await prisma.conversation.findFirst({
          where: {
            type: "DIRECT",
            AND: [
              { participants: { some: { userId: authorId } } },
              { participants: { some: { userId: recipientId } } },
            ],
          },
          include: { participants: true },
        });

        if (direct) {
          convoId = direct.id;
        } else {
          const created = await prisma.conversation.create({
            data: {
              type: "DIRECT",
              participants: {
                create: [{ userId: authorId }, { userId: recipientId }],
              },
            },
            include: { participants: true },
          });
          convoId = created.id;
        }
      }

      if (!convoId) {
        return sendResponse({
          res,
          statusCode: StatusCodes.BAD_REQUEST,
          message: "conversationId or recipientId is required",
          data: null,
        });
      }

      const data = {
        conversationId: convoId,
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
        data,
        include: {
          author: true,
          conversation: {
            include: { participants: { include: { user: true } } },
          },
          reactions: true,
          receipts: true,
        },
      });

      const participants = message.conversation.participants.map(
        (p) => p.userId
      );
      const other =
        message.conversation.type === "DIRECT"
          ? message.conversation.participants
              .map((p) => p.user)
              .find((u) => u.id !== authorId)
          : undefined;

      const payload = {
        id: message.id,
        from: { id: message.authorId, username: message.author.username },
        to:
          message.conversation.type === "DIRECT" && other
            ? { id: other.id, username: other.username }
            : {
                id: message.conversation.id,
                username: message.conversation.name ?? "Group",
              },
        message: message.message,
        messageType: message.messageType.toLowerCase(), // "text" | "file" | "forwarded"
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

      // Emit to all participant user rooms
      participants.forEach((uid) =>
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
