import { PrismaClient } from "@prisma/client";
import { IOServerWithHelpers } from "../../socket/initSocket";
import sendResponse from "../../libs/sendResponse";
import { StatusCodes } from "http-status-codes";

const SendFriendRequest =
  (io: IOServerWithHelpers, prisma: PrismaClient) =>
  async (req: any, res: any) => {
    const senderId = (req as any).userId;
    const { receiverId } = req.params;

    try {
      const request = await prisma.friendRequest.create({
        data: { senderId, receiverId },
        include: { receiver: true, sender: true },
      });

      io.to(receiverId).emit("friend_request", { request });

      return sendResponse({
        res,
        statusCode: StatusCodes.OK,
        message: "Friend request sent",
        data: request,
      });
    } catch (error) {
      console.error("SendFriendRequest error:", error);
      return sendResponse({
        res,
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Failed to send friend request",
        data: null,
      });
    }
  };

export default SendFriendRequest;
