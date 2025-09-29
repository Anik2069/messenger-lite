import { Router } from "express";
import { IOServerWithHelpers } from "../../socket/initSocket";
import authRouter from "./auth/user_auth.routes";
import listRouter from "./meta/meta.routes"; // no io needed
import messagesRouter from "./messages.route/messages.route";
import reactionsRouter from "./reactions/reactions.router";
import readsRouter from "./reads/reads.router";
import friendRouter from "./friend/friend.router";

const v1Router = (io: IOServerWithHelpers) => {
  const router = Router();

  router.use("/auth/user", authRouter(io));

  router.use("/meta", listRouter);

  router.use("/messages", messagesRouter(io));

  router.use("/reactions", reactionsRouter(io));
  router.use("/reads", readsRouter(io));
  router.use("/friend", friendRouter(io));

  return router;
};

export default v1Router;
