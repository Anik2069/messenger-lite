import { Router } from "express";
import { IOServerWithHelpers } from "../../../socket/initSocket";
import userSignin from "../../../controllers/auth/userSignin.controller";
import { userSignup } from "../../../controllers/auth/userSignup.controller";
import userLogout from "../../../controllers/auth/userLogout.controller";

const authRouter = (io: IOServerWithHelpers) => {
  const router = Router();
  router.post("/logout", userLogout(io));

  router.post("/sign-in", userSignin(io));
  router.post("/sign-up", userSignup);

  return router;
};

export default authRouter;
