import { StatusCodes } from "http-status-codes";
import sendResponse from "../../libs/sendResponse";
import { PrismaClient } from "@prisma/client";

const clearMessagesForFriend = (prisma: PrismaClient) => {
  return async (req: any, res: any) => {
    try {
      const { conversationId } = req.params;

      if (!conversationId) {
        return sendResponse({
          res,
          statusCode: StatusCodes.BAD_REQUEST,
          message: "Conversation ID is required",
          data: null,
        });
      }

      //  Make sure it's a DIRECT conversation
      const conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          type: "DIRECT",
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

      await prisma.message.deleteMany({
        where: { conversationId },
      });

      return sendResponse({
        res,
        statusCode: StatusCodes.OK,
        message: "Messages cleared for conversation.",
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
