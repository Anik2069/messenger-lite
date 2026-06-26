import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import { getConversations } from "../../../controllers/message/conversation/GetConversation";
import getConversationMediaController from "../../../controllers/message/getConversationMedia.controller";
import getMessagesController from "../../../controllers/message/getMessage/getMessages.controller";
import clearMessagesForFriend from "../../../controllers/message/messageClear.controller";
import SendMessageHandler from "../../../controllers/message/SendMessageHandler.controller";
import requireAuth from "../../../middlewares/requireAuth";
import { upload } from "../../../middlewares/upload.middleware";
import type { IOServerWithHelpers } from "../../../socket/initSocket";

const messagesRouter = (io: IOServerWithHelpers) => {
  const prisma = new PrismaClient();
  const router = Router();

  router.post(
    "/",
    requireAuth,
    upload.array("files", 5),
    SendMessageHandler(io, prisma)
  );

  router.get("/conversations", requireAuth, getConversations(io, prisma));

  router.get("/:conversationId", requireAuth, getMessagesController(prisma));

  router.delete(
    "/clear/:conversationId",
    requireAuth,
    clearMessagesForFriend(prisma)
  );

  router.get(
    "/:conversationId/media",
    requireAuth,
    getConversationMediaController(prisma)
  );

  return router;
};

export default messagesRouter;
