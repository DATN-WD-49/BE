import { Router } from "express";
import {
  login,
  register,
  verifyUser,
  sendVerify,
  resetPassword,
} from "./auth.controller.js";

const authRoute = Router();

authRoute.post("/register", register);
authRoute.post("/login", login);
authRoute.get("/verify/:token", verifyUser);
authRoute.post("/send-verify", sendVerify);
authRoute.post("/reset-password", resetPassword);

export default authRoute;
