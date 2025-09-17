import { Router } from "express";
import { IOServerWithHelpers } from "../../../socket/initSocket";
import userSignin from "../../../controllers/auth/userSignin.controller";
import { userSignup } from "../../../controllers/auth/userSignup.controller";
import userLogout from "../../../controllers/auth/userLogout.controller";
import requireAuth from "../../../middlewares/requireAuth";
import { prisma } from "../../../configs/prisma.config";

const authRouter = (io: IOServerWithHelpers) => {
  const router = Router();
  router.post("/logout", userLogout(io));

  router.post("/sign-in", userSignin(io));
  router.post("/sign-up", userSignup);

  router.get("/me", requireAuth, async (req, res) => {
    const id = (req as any).auth.userId as string;
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        isOnline: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return res.json({ results: { userInfo: user } });
  });

  return router;
};

export default authRouter;
