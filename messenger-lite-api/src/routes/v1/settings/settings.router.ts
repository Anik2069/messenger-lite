import { PrismaClient } from "@prisma/client";
import { IOServerWithHelpers } from "../../../socket/initSocket";
import { Router } from "express";
import requireAuth from "../../../middlewares/requireAuth";
import SendFriendRequest from "../../../controllers/friend/SendFriendRequest.controller";
import AcceptOrRejectRequest from "../../../controllers/friend/AcceptOrRejectRequest.controller";
import { FriendsList } from "../../../controllers/friend/FriendsList.controller";
import { GetSuggestedFriends } from "../../../controllers/friend/GetSuggestedFriends.controller";
import GetRequestedUsers from "../../../controllers/friend/GetRequestedUsers.controller";

const settingsRouter = (io: IOServerWithHelpers) => {
  const prisma = new PrismaClient();
  const router = Router();

  //   router.patch(
  //     "/update-settings/:id",
  //     requireAuth,
  //     AcceptOrRejectRequest(io, prisma)
  //   );
  //   router.get("/my-settings", requireAuth, FriendsList);
  return router;
};

export default settingsRouter;
