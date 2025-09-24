import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import sendResponse from "../../libs/sendResponse";
import { prisma } from "../../configs/prisma.config";
import type { IOServerWithHelpers } from "../../socket/initSocket";
import { z } from "zod";
import { updateUserPresence } from "../../helpers/presence.helper";

// body schema -> expects activeStatus: boolean
const userActiveStatusDto = z.object({
  activeStatus: z.boolean(),
});

export default function userActiveStatus(io: IOServerWithHelpers) {
  return async (req: Request, res: Response): Promise<Response> => {
    try {
      const { activeStatus } = userActiveStatusDto.parse(req.body);

      const userId = (req as any).userId as string;

      // emit event to other connected clients
      const updatedUser = await updateUserPresence(io, userId, activeStatus);

      return sendResponse({
        res,
        statusCode: StatusCodes.OK,
        message: `User is now ${activeStatus ? "online" : "offline"}`,
        data: updatedUser || null,
      });
    } catch (e: any) {
      console.error("Unexpected active status error:", e?.message);

      return sendResponse({
        res,
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Failed to update active status",
        data: null,
      });
    }
  };
}
