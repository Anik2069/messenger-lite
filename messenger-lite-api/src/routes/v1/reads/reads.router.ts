import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import requireAuth from "../../../middlewares/requireAuth";
import MarkRead from "../../../controllers/message/MarkRead.controller";
import type { IOServerWithHelpers } from "../../../socket/initSocket";

const readsRouter = (io: IOServerWithHelpers) => {
  const prisma = new PrismaClient();
  const router = Router();

  router.post("/:messageId/read", requireAuth, MarkRead(io, prisma));

  return router;
};

export default readsRouter;
