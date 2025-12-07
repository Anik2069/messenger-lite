import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import sendResponse from "../../../libs/sendResponse";
import { PrismaClient } from "@prisma/client";

export default function getMessagesController(prisma: PrismaClient) {
  return async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId as string;
      const { conversationId: param } = req.params;

      // Extract cursor from query params (properly)
      const cursor = req.query.cursor as string | undefined;
      const limit = 20;

      if (!param) {
        return sendResponse({
          res,
          statusCode: StatusCodes.BAD_REQUEST,
          message: "conversationId is required",
          data: { messages: [], hasMore: false, nextCursor: null },
        });
      }

      let conversation = await prisma.conversation.findFirst({
        where: {
          id: param,
          participants: { some: { userId } },
        },
        include: { participants: true },
      });

      // If not found, treat param as peer userId (for DIRECT chat)
      if (!conversation) {
        const peerUserId = param;

        conversation = await prisma.conversation.findFirst({
          where: {
            type: "DIRECT",
            participants: {
              some: { userId },
            },
            AND: {
              participants: { some: { userId: peerUserId } },
            },
          },
          include: { participants: true },
        });
      }

      if (!conversation) {
        return sendResponse({
          res,
          statusCode: StatusCodes.OK,
          message: "Not a participant",
          data: { messages: [], hasMore: false, nextCursor: null },
        });
      }

      // Get the participant of the conversation
      const participant = conversation.participants.find((p) => p.userId === userId);

      // Build where clause with clearedAt filter
      const whereClause: any = {
        conversationId: conversation.id,
        ...(participant?.clearedAt && {
          createdAt: {
            gte: participant.clearedAt,
          },
        }),
      };

      // Fetch messages with cursor-based pagination
      // We fetch limit + 1 to check if there are more messages
      const messages = await prisma.message.findMany({
        where: whereClause,
        include: {
          author: { select: { id: true, username: true, avatar: true } },
          reactions: { include: { user: { select: { id: true, username: true, avatar: true, email: true } } } },
          receipts: { include: { user: { select: { id: true, username: true, avatar: true, email: true } } } },
        },
        orderBy: { createdAt: "desc" }, // Newest first for cursor pagination
        take: limit + 1, // Fetch one extra to check hasMore
        ...(cursor && {
          cursor: { id: cursor },
          skip: 1, // Skip the cursor itself
        }),
      });

      // Check if there are more messages
      const hasMore = messages.length > limit;

      // Remove the extra message if we have more
      const paginatedMessages = hasMore ? messages.slice(0, limit) : messages;

      // Get the next cursor (last message ID)
      const lastMessage = paginatedMessages[paginatedMessages.length - 1];
      const nextCursor = hasMore && lastMessage ? lastMessage.id : null;

      // Reverse to show oldest first (chronological order)
      const normalized = paginatedMessages.reverse().map((m) => ({
        ...m,
        author: { ...m.author, id: String(m.author.id) },
      }));

      return sendResponse({
        res,
        statusCode: StatusCodes.OK,
        message: "Messages fetched",
        data: {
          messages: normalized,
          hasMore,
          nextCursor,
        },
      });
    } catch (err) {
      console.error(err);
      return sendResponse({
        res,
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Failed to fetch messages",
        data: { messages: [], hasMore: false, nextCursor: null },
      });
    }
  };
}
