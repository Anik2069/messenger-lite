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

      // Check if conversation exists and user is a participant
      const participant = await prisma.conversationParticipant.findUnique({
        where: {
          userId_conversationId: {
            userId: (req as any).userId,
            conversationId,
          },
        },
      });

      if (!participant) {
        return sendResponse({
          res,
          statusCode: StatusCodes.FORBIDDEN,
          message: "You are not a participant of this conversation",
          data: null,
        });
      }



      await prisma.conversationParticipant.update({
        where: {
          userId_conversationId: {
            userId: (req as any).userId,
            conversationId,
          },
        },
        data: {
          clearedAt: new Date(),
        },
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
