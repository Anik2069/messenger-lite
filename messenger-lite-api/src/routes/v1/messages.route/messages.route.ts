import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import type { IOServerWithHelpers } from "../../../socket/initSocket";
import SendMessageHandler from "../../../controllers/message/SendMessageHandler.controller";
import requireAuth from "../../../middlewares/requireAuth";
import { getConversations } from "../../../controllers/message/conversation/GetConversation";
import getMessagesController from "../../../controllers/message/getMessage/getMessages.controller";
import { upload } from "../../../middlewares/upload.middleware";

const messagesRouter = (io: IOServerWithHelpers) => {
  const prisma = new PrismaClient();
  const router = Router();

  // Send message (TEXT, FILE, FORWARDED) with duplicate-free handling
  router.post(
    "/",
    requireAuth,
    upload.array("files", 5),
    SendMessageHandler(io, prisma)
  );

  // Get all conversations
  router.get("/conversations", requireAuth, getConversations(io, prisma));

  // Get messages of a conversation
  router.get("/:conversationId", requireAuth, getMessagesController(prisma));

  return router;
};

export default messagesRouter;
