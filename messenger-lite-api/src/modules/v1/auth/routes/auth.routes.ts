import { Router } from "express";
import { login } from "../controller/auth.controller";

const AuthSection = Router();

AuthSection.post("/login", login);

export default AuthSection;
