import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import sendResponse from "../../libs/sendResponse";
import { PrismaClient } from "@prisma/client";

export default function getConversationMediaController(prisma: PrismaClient) {
    return async (req: Request, res: Response) => {
        try {
            const userId = (req as any).userId as string;
            const { conversationId } = req.params;

            if (!conversationId) {
                return sendResponse({
                    res,
                    statusCode: StatusCodes.BAD_REQUEST,
                    message: "conversationId is required",
                    data: { media: [] },
                });
            }

            // Verify user is a participant of this conversation
            const conversation = await prisma.conversation.findFirst({
                where: {
                    id: conversationId,
                    participants: { some: { userId } },
                },
                include: { participants: true },
            });

            if (!conversation) {
                return sendResponse({
                    res,
                    statusCode: StatusCodes.FORBIDDEN,
                    message: "Not a participant of this conversation",
                    data: { media: [] },
                });
            }

            // Get the participant's clearedAt timestamp
            const participant = conversation.participants.find((p) => p.userId === userId);

            // Fetch all media files (images and videos) from the conversation
            const mediaMessages = await prisma.message.findMany({
                where: {
                    conversationId,
                    messageType: "FILE",
                    fileUrl: { not: null },
                    OR: [
                        { fileMime: { startsWith: "image/" } },
                        { fileMime: { startsWith: "video/" } },
                    ],
                    // Only show media after the user's clearedAt timestamp
                    ...(participant?.clearedAt && {
                        createdAt: {
                            gte: participant.clearedAt,
                        },
                    }),
                },
                include: {
                    author: {
                        select: {
                            id: true,
                            username: true,
                            avatar: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: "desc", // Newest first
                },
            });

            return sendResponse({
                res,
                statusCode: StatusCodes.OK,
                message: "Media fetched successfully",
                data: { media: mediaMessages },
            });
        } catch (err) {
            console.error("Error fetching conversation media:", err);
            return sendResponse({
                res,
                statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
                message: "Failed to fetch media",
                data: { media: [] },
            });
        }
    };
}
