import { FriendStatus, PrismaClient } from "@prisma/client";
import { IOServerWithHelpers } from "../../socket/initSocket";
import sendResponse from "../../libs/sendResponse";
import { StatusCodes } from "http-status-codes";

const AcceptOrRejectRequest = (
  io: IOServerWithHelpers,
  prisma: PrismaClient
) => {
  return async (req: any, res: any) => {
    try {
      const { id } = (req as any).params as { id: string };
      const { status } = (req as any).body as { status: FriendStatus };
      const userId = (req as any).userId;

      const request = await prisma.friendRequest.update({
        where: { id },
        data: { status },
        include: { sender: true, receiver: true },
      });

      io.to(request.senderId).emit("friend_request_update", { request });
      io.to(request.receiverId).emit("friend_request_update", { request });

      sendResponse({
        res,
        statusCode: StatusCodes.OK,
        message: "Friend request updated successfully",
        data: request,
      });
    } catch (error: any) {
      console.error("Error updating friend request:", error);
      sendResponse({
        res,
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Failed to update friend request",
        data: null,
      });
    }
  };
};

export default AcceptOrRejectRequest;
