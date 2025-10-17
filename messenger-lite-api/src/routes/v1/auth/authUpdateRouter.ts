import { Router } from "express";
import { IOServerWithHelpers } from "../../../socket/initSocket";
import userSignin from "../../../controllers/auth/userSignin.controller";
import userLogout from "../../../controllers/auth/userLogout.controller";
import requireAuth from "../../../middlewares/requireAuth";
import { prisma } from "../../../configs/prisma.config";
import userActiveStatus from "../../../controllers/auth/userActiveStatus";
import { userSignup } from "../../../controllers/auth/userSignup.controller";
import {
  generate2FA,
  remove2FA,
  verify2FASetup,
} from "../../../controllers/auth/user_auth.controller";
import { confirm2FA } from "../../../controllers/auth/confirm2FA.controller";
import { updatePassword } from "../../../controllers/auth/update/updatePassword.controller";

const authUpdateRouter = (io: IOServerWithHelpers) => {
  const router = Router();
  router.patch("/password", requireAuth, updatePassword);

  return router;
};

export default authUpdateRouter;
