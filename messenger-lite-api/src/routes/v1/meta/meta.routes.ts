import { Router } from "express";
import userFriendsRoutes from "../meta/routes/friends.routes";
import { AllUserList } from "../../../controllers/meta/AllUserList.controller";
import requireAuth from "../../../middlewares/requireAuth";

const router = Router();

router.use("/friends", userFriendsRoutes);
router.get("/all-user-list", requireAuth, AllUserList);

export default router;
