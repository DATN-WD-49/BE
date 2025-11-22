import { Router } from "express";
import {
  createManySchedule,
  createSchedule,
  getAllSchedule,
  getDetailSchedule,
  insertManySchedule,
  updateSchedule,
  updateStatusSchedule,
} from "./schedule.controller.js";

const scheduleRoute = Router();

scheduleRoute.get("/", getAllSchedule);
scheduleRoute.get("/detail/:id", getDetailSchedule);
scheduleRoute.post("/", createSchedule);
scheduleRoute.post("/many", createManySchedule);
scheduleRoute.post("/insert/many", insertManySchedule);
scheduleRoute.patch("/update/:id", updateSchedule);
scheduleRoute.patch("/status/:id", updateStatusSchedule);

export default scheduleRoute;
