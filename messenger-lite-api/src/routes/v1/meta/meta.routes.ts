import { Router } from "express";
import userFriendsRoutes from "../meta/routes/friends.routes";

const router = Router();

router.use("/friends", userFriendsRoutes);

export default router;
