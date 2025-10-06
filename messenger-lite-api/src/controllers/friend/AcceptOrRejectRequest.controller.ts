import { StatusCodes } from "http-status-codes";
import sendResponse from "../../libs/sendResponse";
import { IOServerWithHelpers } from "../../socket/initSocket";
import { FriendStatus, PrismaClient } from "@prisma/client";

const AcceptOrRejectRequest = (
  io: IOServerWithHelpers,
  prisma: PrismaClient
) => {
  return async (req: any, res: any) => {
    try {
      const { id } = req.params as { id: string };
      const status = req.query.status as FriendStatus;
      const userId = req.userId;

      if (!["ACCEPTED", "REJECTED"].includes(status)) {
        return sendResponse({
          res,
          statusCode: StatusCodes.BAD_REQUEST,
          message: "Invalid status. Only ACCEPTED or REJECTED are allowed.",
          data: null,
        });
      }

      const request = await prisma.friendRequest.findFirst({
        where: { senderId: id, receiverId: userId, status: "PENDING" },
        include: { sender: true, receiver: true },
      });

      if (!request) {
        return sendResponse({
          res,
          statusCode: StatusCodes.NOT_FOUND,
          message: "No pending friend request found from this user.",
          data: null,
        });
      }

      let updatedRequest;

      if (status === "ACCEPTED") {
        updatedRequest = await prisma.friendRequest.update({
          where: { id: request.id },
          data: { status },
          include: { sender: true, receiver: true },
        });
      } else {
        // REJECTED → delete
        await prisma.friendRequest.delete({ where: { id: request.id } });
        updatedRequest = { ...request, status: "REJECTED" };
      }

      // Emit update
      io.to(request.senderId).emit("friend_request_update", {
        request: updatedRequest,
      });
      io.to(request.receiverId).emit("friend_request_update", {
        request: updatedRequest,
      });

      return sendResponse({
        res,
        statusCode: StatusCodes.OK,
        message: `Friend request ${status.toLowerCase()} successfully.`,
        data: updatedRequest,
      });
    } catch (error: any) {
      console.error(" Error updating friend request:", error);
      return sendResponse({
        res,
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Failed to update friend request",
        data: null,
      });
    }
  };
};

export default AcceptOrRejectRequest;
