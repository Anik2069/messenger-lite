import { Router, Request, Response } from "express";
import AuthSection from "./auth/routes/auth.routes";

const messengerLite_v1_router = Router();

messengerLite_v1_router.use("/auth", AuthSection);

export default messengerLite_v1_router;
