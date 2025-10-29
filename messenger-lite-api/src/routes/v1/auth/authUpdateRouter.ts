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
import { upload } from "../../../middlewares/upload.middleware";
import { updateProfilePicture } from "../../../controllers/auth/update/updateProfilePicture.controller";

const authUpdateRouter = (io: IOServerWithHelpers) => {
  const router = Router();
  router.patch("/password", requireAuth, updatePassword);
  router.patch(
    "/profile-picture",
    requireAuth,
    upload.single("profile_pic"),
    updateProfilePicture
  );

  return router;
};

export default authUpdateRouter;
