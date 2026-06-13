import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import sendResponse from "../../libs/sendResponse";
import { IOServerWithHelpers } from "../../socket/initSocket";
import { getUserConversationsSorted } from "../message/SendMessageHandler.controller";
import fs from "fs";
import path from "path";

const CreateGroupConversation = (
  io: IOServerWithHelpers,
  prisma: PrismaClient
) => {
  return async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      const { name, memberIds } = req.body;



      if (!name) {
        return sendResponse({
          res,
          statusCode: StatusCodes.BAD_REQUEST,
          message: "Group name is required",
          data: null,
        });
      }

      let parsedMemberIds: string[] = [];
      if (memberIds) {
        if (Array.isArray(memberIds)) {
          parsedMemberIds = memberIds;
        } else if (typeof memberIds === 'string') {
          try {
            parsedMemberIds = JSON.parse(memberIds);
          } catch (e) {
            parsedMemberIds = [memberIds];
          }
        }
      }

      // Add the creator as an admin
      const allParticipants = [
        { userId, role: "ADMIN" as const },
        ...parsedMemberIds.map((id) => ({ userId: id, role: "MEMBER" as const })),
      ];


      // Handle avatar file
      let avatarPath = null;
      if (req.file) {
        avatarPath = path.join("uploads", req.file.filename);
      }

      // Create conversation
      const conversation = await prisma.conversation.create({
        data: {
          type: "GROUP",
          name,
          avatar: avatarPath,
          participants: {
            create: allParticipants,
          },
        },
      });

      // Emit socket updates
      const participants = await prisma.conversationParticipant.findMany({
        where: { conversationId: conversation.id },
        select: { userId: true },
      });

      for (const p of participants) {
        const updatedList = await getUserConversationsSorted(prisma, p.userId);
        io.of("/chat").to(p.userId).emit("conversations_updated", updatedList);
      }

      return sendResponse({
        res,
        statusCode: StatusCodes.CREATED,
        message: "Group conversation created successfully",
        data: conversation,
      });
      // return sendResponse({
      //   res,
      //   statusCode: StatusCodes.BAD_REQUEST,
      //   message: "Group conversation created successfully",
      //   data: null,
      // });
    } catch (error: any) {
      console.error("Error creating group conversation:", error);
      return sendResponse({
        res,
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Failed to create group conversation",
        data: null,
      });
    }
  };
};

export default CreateGroupConversation;
