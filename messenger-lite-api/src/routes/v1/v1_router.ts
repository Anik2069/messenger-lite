import { Router } from "express";
import authRouter from "./auth/auth.routes";
import listRouter from "./meta/meta.routes";

const v1Router = Router();
v1Router.use("/auth", authRouter); // Path: /api/v1/auth/...
v1Router.use("/meta", listRouter); // Path: /api/v1/auth/...

export default v1Router;
