// src/modules/v1/messeangerLite_v1_router.ts
import { Router, Request, Response } from "express";
import Authsection from "./auth/routes/auth.routes";

const messeangerLite_v1_router = Router();

messeangerLite_v1_router.use("/auth", Authsection);

export default messeangerLite_v1_router;
