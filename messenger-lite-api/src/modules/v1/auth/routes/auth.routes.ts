// src/modules/v1/admin_auth/admin_auth.router.ts
import { Router } from "express";

const Authsection = Router();

import { login } from "../controller/auth.controller";

Authsection.post("/login", login);

export default Authsection;
