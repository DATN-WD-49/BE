import { Router } from "express";
import { getSeatSchedule } from "./seat-schedule.controller";

const seatScheduleRoute = Router();
seatScheduleRoute.get("seat-map/:carId/:scheduleId", getSeatSchedule);

export default seatScheduleRoute;
