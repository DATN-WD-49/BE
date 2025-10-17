import { Router } from "express";
import {
  login,
  register,
  verifyUser,
  sendVerify,
  resetPassword,
  callbackLoginGoogle,
  loginGoogle,
} from "./auth.controller.js";

const authRoute = Router();

authRoute.post("/register", register);
authRoute.post("/login", login);
authRoute.get("/verify/:token", verifyUser);
authRoute.post("/send-verify", sendVerify);
authRoute.post("/reset-password", resetPassword);
authRoute.post("/google, login", loginGoogle);
authRoute.get("/google/callback", callbackLoginGoogle);

export default authRoute;
