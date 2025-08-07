import { Router } from "express";
import userAuthRoutes from "./routes/user_auth.routes";

const router = Router();

router.use("/user", userAuthRoutes);

export default router;
