import { PrismaClient } from "@prisma/client";
import sendResponse from "../../libs/sendResponse";
import { StatusCodes } from "http-status-codes";

const GetPendingRequests =
  (prisma: PrismaClient) => async (req: any, res: any) => {
    try {
      const userId = (req as any).userId;

      const requests = await prisma.friendRequest.findMany({
        where: { receiverId: userId, status: "PENDING" },
        include: { sender: true },
      });

      if (requests) {
        return sendResponse({
          res,
          statusCode: StatusCodes.OK,
          message: "Pending friend requests fetched successfully",
          data: requests,
        });
      }
    } catch (error) {
      return sendResponse({
        res,
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Failed to fetch pending friend requests",
        data: null,
      });
    }
  };

export default GetPendingRequests;
