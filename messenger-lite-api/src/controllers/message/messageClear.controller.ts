// src/controllers/messages/messageClear.controller.ts
import { StatusCodes } from "http-status-codes";
import sendResponse from "../../libs/sendResponse";
import { PrismaClient } from "@prisma/client";

const clearMessagesForFriend = (prisma: PrismaClient) => {
  return async (req: any, res: any) => {
    try {
      const userId = req.userId;
      const { friendId } = req.params;

      if (!userId) {
        return sendResponse({
          res,
          statusCode: StatusCodes.UNAUTHORIZED,
          message: "Unauthorized",
          data: null,
        });
      }

      if (!friendId) {
        return sendResponse({
          res,
          statusCode: StatusCodes.BAD_REQUEST,
          message: "Friend ID is required",
          data: null,
        });
      }

      // 1️⃣ Find the DIRECT conversation between these two users
      const conversation = await prisma.conversation.findFirst({
        where: {
          type: "DIRECT",
          AND: [
            { participants: { some: { userId } } },
            { participants: { some: { userId: friendId } } },
          ],
        },
      });

      if (!conversation) {
        return sendResponse({
          res,
          statusCode: StatusCodes.NOT_FOUND,
          message: "No direct conversation found with this user",
          data: null,
        });
      }

      // 2️⃣ Get all message IDs in that conversation
      const messages = await prisma.message.findMany({
        where: { conversationId: conversation.id },
        select: { id: true },
      });

      const messageIds = messages.map((m) => m.id);

      // 3️⃣ Delete reads, reactions, and messages (for both users)
      await prisma.$transaction([
        prisma.messageRead.deleteMany({
          where: { messageId: { in: messageIds } },
        }),
        prisma.messageReaction.deleteMany({
          where: { messageId: { in: messageIds } },
        }),
        prisma.message.deleteMany({
          where: { conversationId: conversation.id },
        }),
      ]);

      return sendResponse({
        res,
        statusCode: StatusCodes.OK,
        message: `All messages between you and user ${friendId} have been cleared for both sides.`,
        data: null,
      });
    } catch (error: any) {
      console.error("Error clearing messages:", error);
      return sendResponse({
        res,
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Failed to clear messages",
        data: null,
      });
    }
  };
};

export default clearMessagesForFriend;
