import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import type { IOServerWithHelpers } from "../../../socket/initSocket";
import SendMessageHandler from "../../../controllers/message/SendMessageHandler.controller";
import requireAuth from "../../../middlewares/requireAuth";
import { getConversations } from "../../../controllers/message/conversation/GetConversation";
import getMessagesController from "../../../controllers/message/getMessage/getMessages.controller";

const messagesRouter = (io: IOServerWithHelpers) => {
  const prisma = new PrismaClient();
  const router = Router();

  router.post("/", requireAuth, SendMessageHandler(io, prisma));

  router.get("/conversations", requireAuth, getConversations(io, prisma));
  router.get("/:conversationId", requireAuth, getMessagesController(prisma));

  return router;
};

export default messagesRouter;
