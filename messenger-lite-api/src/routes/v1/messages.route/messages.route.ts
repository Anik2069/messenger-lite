import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import type { IOServerWithHelpers } from "../../../socket/initSocket";
import SendMessageHandler from "../../../controllers/message/SendMessageHandler.controller";
import requireAuth from "../../../middlewares/requireAuth";

const messagesRouter = (io: IOServerWithHelpers) => {
  const prisma = new PrismaClient();
  const router = Router();

  router.post("/", requireAuth, SendMessageHandler(io, prisma));

  return router;
};

export default messagesRouter;
