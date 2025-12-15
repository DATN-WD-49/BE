import { throwError } from "../../common/utils/create-response.js";
import Car from "../car/car.model.js";
import Route from "../route/route.model.js";
import Schedule from "../schedule/schedule.model.js";
import Seat from "../seat/seat.model.js";
import { ORDER_MESSAGES } from "./order.message.js";

export const checkAvaliableCar = async (carId) => {
  const car = await Car.findById(carId);
  if (!car) {
    throwError(400, ORDER_MESSAGES.CAR_NOT_FOUND);
  }
  if (!car.status) {
    throwError(400, ORDER_MESSAGES.CAR_NOT_AVALIABLE(car.licensePlate));
  }
  return true;
};

export const checkAvaliableRoute = async (routeId) => {
  const route = await Route.findById(routeId);
  if (!route) {
    throwError(400, ORDER_MESSAGES.ROUTE_NOT_FOUND);
  }
  if (!route.status) {
    throwError(400, ORDER_MESSAGES.ROUTE_NOT_AVALIABLE(route));
  }
  return true;
};

export const checkAvaliableSchedule = async (scheduleId) => {
  const schedule = await Schedule.findById(scheduleId);
  if (!schedule) {
    throwError(400, ORDER_MESSAGES.SCHEDULE_NOT_FOUND);
  }
  if (schedule.status === "cancelled") {
    throwError(400, ORDER_MESSAGES.SCHEDULE_NOT_AVALIABLE(schedule));
  }
  return true;
};

export const checkAvaliableSeat = async (seatIds) => {
  if (!Array.isArray(seatIds) || seatIds.length === 0) {
    throwError(400, ORDER_MESSAGES.NOT_VALID_SEATS);
  }
  const seats = await Seat.find({ _id: { $in: seatIds } });
  if (seatIds.length !== seats.length) {
    throwError(400, ORDER_MESSAGES.SEAT_NOT_FOUND);
  }
  const invalidSeats = seats.filter(
    (seat) => seat.status === "buyed" || seat.status === "used",
  );
  if (invalidSeats.length > 0) {
    const seatLabels = invalidSeats.map((inSeat) => inSeat.label).join(", ");
    throwError(400, ORDER_MESSAGES.SEAT_NOT_AVALIABLE);
  }
  return true;
};
