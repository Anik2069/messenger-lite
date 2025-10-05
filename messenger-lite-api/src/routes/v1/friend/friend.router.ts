import { PrismaClient } from "@prisma/client";
import { IOServerWithHelpers } from "../../../socket/initSocket";
import { Router } from "express";
import requireAuth from "../../../middlewares/requireAuth";
import SendFriendRequest from "../../../controllers/friend/SendFriendRequest.controller";
import GetPendingRequests from "../../../controllers/friend/GetPendingRequests.controller";
import AcceptOrRejectRequest from "../../../controllers/friend/AcceptOrRejectRequest.controller";
import { FriendsList } from "../../../controllers/friend/FriendsList.controller";
import { GetSuggestedFriends } from "../../../controllers/friend/GetSuggestedFriends.controller";
import GetRequestedUsers from "../../../controllers/friend/GetRequestedUsers.controller";

const friendRouter = (io: IOServerWithHelpers) => {
  const prisma = new PrismaClient();
  const router = Router();

  router.post(
    "/request/:receiverId",
    requireAuth,
    SendFriendRequest(io, prisma)
  );
  router.get("/request/pending", requireAuth, GetPendingRequests(prisma));

  router.patch("/request/:id", requireAuth, AcceptOrRejectRequest(io, prisma));
  router.get("/friend-list", requireAuth, FriendsList);
  router.get("/suggested", requireAuth, GetSuggestedFriends);
  router.get("/requested-users", requireAuth, GetRequestedUsers(prisma));
  return router;
};

export default friendRouter;
