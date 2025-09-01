import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import requireAuth from "../../../middlewares/requireAuth";
import ToggleReaction from "../../../controllers/message/ToggleReaction.controller";
import type { IOServerWithHelpers } from "../../../socket/initSocket";

const reactionsRouter = (io: IOServerWithHelpers) => {
  const prisma = new PrismaClient();
  const router = Router();

  router.post("/:messageId/reactions", requireAuth, ToggleReaction(io, prisma));

  return router;
};

export default reactionsRouter;
