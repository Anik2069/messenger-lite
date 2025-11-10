// src/controllers/messages/messageClear.controller.ts
import { StatusCodes } from "http-status-codes";
import sendResponse from "../../libs/sendResponse";
import { PrismaClient } from "@prisma/client";
import { ApiError } from "../../libs/error";

/**
 * DELETE /api/v1/messages/clear/:friendId
 * Clears all messages for the logged-in user in a direct conversation
 */

const clearMessagesForFriend = (prisma: PrismaClient) => {
  return async (req: any, res: any, next: any) => {
    try {
      const userId = req.userId; // ✅ using your middleware’s convention
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
          participants: {
            every: {
              userId: { in: [userId, friendId] },
            },
          },
        },
        include: { participants: true },
      });

      if (!conversation) {
        return sendResponse({
          res,
          statusCode: StatusCodes.NOT_FOUND,
          message: "No direct conversation found with this user",
          data: null,
        });
      }

      if (conversation.participants.length !== 2) {
        return sendResponse({
          res,
          statusCode: StatusCodes.BAD_REQUEST,
          message: "This is not a valid direct conversation",
          data: null,
        });
      }

      // 2️⃣ Delete all reads, reactions, and authored messages by this user
      await prisma.$transaction([
        prisma.messageRead.deleteMany({
          where: {
            userId,
            message: { conversationId: conversation.id },
          },
        }),
        prisma.messageReaction.deleteMany({
          where: {
            userId,
            message: { conversationId: conversation.id },
          },
        }),
        prisma.message.deleteMany({
          where: {
            conversationId: conversation.id,
            authorId: userId,
          },
        }),
      ]);

      return sendResponse({
        res,
        statusCode: StatusCodes.OK,
        message: `All messages from your chat with user ${friendId} have been cleared.`,
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
