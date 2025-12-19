import { Router } from "express";
import {
  changeLockUser,
  createUser,
  getAllUser,
  getDetailUser,
  getProfile,
  updateUser,
  updateUserProfile,
} from "./user.controller.js";

const userRoute = Router();

userRoute.get("/private", getProfile);
userRoute.patch("/profile", updateUserProfile);
//những route này cần role admin
userRoute.get("/", getAllUser);
userRoute.get("/:id", getDetailUser);
userRoute.post("/", createUser);
userRoute.patch("/update/:id", updateUser);
userRoute.patch("/lock/:id", changeLockUser);

export default userRoute;
