import { Router } from "express";
import {
  getCarSeat,
  updateSeat,
  updateStatusSeat,
  createSeat,
  deleteSeat,
  createFloor,
  deleteFloor,
  updateStatusFloor,
} from "./seat.controller.js ";
import { authenticate } from "../../common/middlewares/auth.middleware.js";
import { JWT_ACCESS_SECRET } from "../../common/configs/environment.js";
import { vaildRole } from "../../common/middlewares/role.middleware.js";

const seatRoute = Router();

seatRoute.get("/car/:id", getCarSeat);
seatRoute.use(authenticate(JWT_ACCESS_SECRET), vaildRole("admin"));
seatRoute.post("/floor/create", createFloor);
seatRoute.patch("/floor/delete", deleteFloor);
seatRoute.patch("/floor/status", updateStatusFloor);
seatRoute.post("/create", createSeat);
seatRoute.patch("/update/:carId/:id", updateSeat);
seatRoute.patch("/status/:id", updateStatusSeat);
seatRoute.delete("/delete/:id", deleteSeat);

export default seatRoute;
