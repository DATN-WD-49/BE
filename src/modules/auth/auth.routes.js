import { Router } from "express";
import {
  callbackLoginGoogle,
  login,
  loginGoogle,
  register,
  verifyUser,
} from "./auth.controller.js";

const authRoute = Router();

authRoute.post("/register", register);
authRoute.post("/login", login);
authRoute.get("/verify/:token", verifyUser);
authRoute.post("/google, login", loginGoogle);
authRoute.get("/google/callback", callbackLoginGoogle);

export default authRoute;
