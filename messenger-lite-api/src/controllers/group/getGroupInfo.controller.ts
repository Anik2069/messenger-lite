import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { IOServerWithHelpers } from "../../socket/initSocket";
import sendResponse from "../../libs/sendResponse";
import { StatusCodes } from "http-status-codes";

const getGroupInfo = (
    io: IOServerWithHelpers,
    prisma: PrismaClient
) => {
    return async (req: Request, res: Response) => {
        try {
            const userId = (req as any).userId;
            const { conversationId } = req.params;

            if (!conversationId) {
                return sendResponse({
                    res,
                    statusCode: StatusCodes.BAD_REQUEST,
                    message: "Conversation ID is required",
                    data: null,
                });
            }

            const conversation = await prisma.conversation.findUnique({
                where: { id: conversationId },
                include: {
                    participants: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    username: true,
                                    avatar: true,
                                },
                            },
                        },
                    },
                },
            });

            if (!conversation) {
                return sendResponse({
                    res,
                    statusCode: StatusCodes.NOT_FOUND,
                    message: "Conversation not found",
                    data: null,
                });
            }

            return sendResponse({
                res,
                statusCode: StatusCodes.OK,
                message: "Group info fetched successfully",
                data: conversation,
            });
        } catch (error: any) {
            console.error("Error fetching group info:", error);
            return sendResponse({
                res,
                statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
                message: "Failed to fetch group info",
                data: null,
            });
        }
    };
};

export default getGroupInfo;