import express from "express";
import { userFriendsList } from "../../../../controllers/meta/userFriendsList.controller";
import requireAuth from "../../../../middlewares/requireAuth";

const router = express.Router();

router.get("/list", requireAuth, userFriendsList);

export default router;
