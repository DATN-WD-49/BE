import { Router } from "express";
import {
  getCarSeat,
  updateSeat,
  updateStatusSeat,
  createSeat,
  deleteSeat,
} from "./seat.controller.js ";

const seatRoute = Router();

seatRoute.get("/car/:id", getCarSeat);
seatRoute.post("/create", createSeat);
seatRoute.patch("/update/:carId/:id", updateSeat);
seatRoute.patch("/status/:id", updateStatusSeat);
seatRoute.delete("/delete/:id", deleteSeat);

export default seatRoute;
