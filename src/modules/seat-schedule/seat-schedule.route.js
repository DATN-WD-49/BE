import { Router } from "express";
import {
  getSeatSchedule,
  toggleSeat,
  unholdSeats,
} from "./seat-schedule.controller.js";
import { authenticate } from "../../common/middlewares/auth.middleware.js";
import { JWT_ACCESS_SECRET } from "../../common/configs/environment.js";

const seatScheduleRoute = Router();
seatScheduleRoute.get("/seat-map/:carId/:scheduleId", getSeatSchedule);
seatScheduleRoute.use(authenticate(JWT_ACCESS_SECRET));
seatScheduleRoute.post("/toogle-seat", toggleSeat);
seatScheduleRoute.patch("/un-hold", unholdSeats);

export default seatScheduleRoute;
