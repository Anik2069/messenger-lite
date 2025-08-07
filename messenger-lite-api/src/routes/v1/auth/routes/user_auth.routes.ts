import { userSignup } from "../../../../controllers/auth/userSignup.controller";
import express from "express";

const router = express.Router();

router.post("/sign-up", userSignup);

export default router;
