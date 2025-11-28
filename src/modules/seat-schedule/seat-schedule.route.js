import { Router } from "express";
import { getSeatSchedule, toggleSeat } from "./seat-schedule.controller.js";
import { authenticate } from "../../common/middlewares/auth.middleware.js";
import { JWT_ACCESS_SECRET } from "../../common/configs/environment.js";

const seatScheduleRoute = Router();
seatScheduleRoute.get("seat-map/:carId/:scheduleId", getSeatSchedule);
seatScheduleRoute.use(authenticate(JWT_ACCESS_SECRET));
seatScheduleRoute.post("/toggle-seat", toggleSeat);

export default seatScheduleRoute;
