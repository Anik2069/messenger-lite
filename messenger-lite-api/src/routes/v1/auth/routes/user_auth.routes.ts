import { userLogout } from "../../../../controllers/auth/userLogout.controller";
import { userSignin } from "../../../../controllers/auth/userSignin.controller";
import { userSignup } from "../../../../controllers/auth/userSignup.controller";
import express from "express";

const router = express.Router();

router.post("/sign-up", userSignup);
router.post("/sign-in", userSignin);
router.get("/logout", userLogout);

export default router;
