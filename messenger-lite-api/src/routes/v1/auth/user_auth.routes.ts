import { Router } from "express";
import { IOServerWithHelpers } from "../../../socket/initSocket";
import userSignin from "../../../controllers/auth/userSignin.controller";
import userLogout from "../../../controllers/auth/userLogout.controller";
import requireAuth from "../../../middlewares/requireAuth";
import { prisma } from "../../../configs/prisma.config";
import userActiveStatus from "../../../controllers/auth/userActiveStatus";
import {
  trustedDevices,
  userSignup,
} from "../../../controllers/auth/userSignup.controller";
import {
  generate2FA,
  remove2FA,
  verify2FASetup,
} from "../../../controllers/auth/user_auth.controller";
import { confirm2FA } from "../../../controllers/auth/confirm2FA.controller";
import tr from "zod/v4/locales/tr.cjs";

const authRouter = (io: IOServerWithHelpers) => {
  const router = Router();
  router.post("/logout", userLogout(io));
  router.post("/2fa/generate", requireAuth, generate2FA);
  router.post("/2fa/verify-setup", requireAuth, verify2FASetup);
  router.post("/2fa/remove", requireAuth, remove2FA);

  router.post("/sign-in", userSignin(io));
  router.post("/verify-2FA/sign-in", confirm2FA);
  router.post("/sign-up", userSignup(io));
  router.get("/trusted-devices/:id", trustedDevices(io));

  router.get("/me", requireAuth, async (req, res) => {
    const id = (req as any).auth.userId as string;
    const user = await prisma.user.findUnique({
      where: { id },
      omit: { password: true, twoFASecret: true },
    });
    return res.json({ results: { userInfo: user } });
  });
  router.post("/activeStatus", requireAuth, userActiveStatus(io));

  return router;
};

export default authRouter;
