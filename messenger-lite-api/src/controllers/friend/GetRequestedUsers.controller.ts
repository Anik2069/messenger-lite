import { PrismaClient } from "@prisma/client";
import sendResponse from "../../libs/sendResponse";
import { StatusCodes } from "http-status-codes";

const GetRequestedUsers =
  (prisma: PrismaClient) => async (req: any, res: any) => {
    try {
      const userId = req.userId;
      const search = (req.query.search as string) || "";

      // 🟢 Fetch users to whom the logged-in user sent friend requests (PENDING)
      const requestedUsers = await prisma.friendRequest.findMany({
        where: {
          senderId: userId,
          status: "PENDING",
          receiver: {
            username: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
        include: {
          receiver: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      // 🧩 Extract only the receiver user info
      const users = requestedUsers.map((req) => ({
        id: req.receiver.id,
        username: req.receiver.username,
        email: req.receiver.email,
        avatar: req.receiver.avatar,
        isOnline: req.receiver.isOnline,
        requestCreatedAt: req.createdAt,
        requestUpdatedAt: req.updatedAt,
      }));
      console.log(users);
      return sendResponse({
        res,
        statusCode: StatusCodes.OK,
        message: "Users you sent friend requests to fetched successfully",
        data: users,
      });
    } catch (error: any) {
      console.error("❌ Error fetching requested users:", error);

      return sendResponse({
        res,
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Failed to fetch requested users",
        data: null,
      });
    }
  };

export default GetRequestedUsers;
