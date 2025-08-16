import express from "express";
import { userFriendsList } from "../../../../controllers/meta/userFriendsList.controller";

const router = express.Router();

router.get("/list", userFriendsList);

export default router;
