import { throwError } from "../../common/utils/create-response.js";
import { getIO } from "../../socket/socket.instance.js";
import Schedule from "../schedule/schedule.model.js";
import Seat from "../seat/seat.model.js";
import { SEAT_SCHEDULE_MESSAGE } from "./seat-schedule.message.js";
import SeatSchedule from "./seat-schedule.model.js";

export const getSeatScheduleService = async (carId, scheduleId) => {
  const seats = await Seat.find({ carId }).lean();
  const seatSchedules = await SeatSchedule.find({ scheduleId }).lean();
  const scheduleData = await Schedule.findById(scheduleId);
  const result = seats.map((seat) => {
    const schedule = seatSchedules.find(
      (sc) => sc.seatId.toString() === seat._id.toString(),
    );
    let bookingStatus = "avaliable";
    let userId = null;
    if (schedule) bookingStatus = schedule.status;
    if (schedule) userId = schedule.userId;
    return {
      ...seat,
      userId,
      price: scheduleData.price,
      bookingStatus,
    };
  });
  const grouped = result.reduce((acc, seat) => {
    if (!acc[seat.floor]) acc[seat.floor] = [];
    acc[seat.floor].push(seat);
    return acc;
  }, {});
  const getCols = (seats) => {
    if (!Array.isArray(seats) || seats.length === 0) return 0;
    return Math.max(...seats.map((se) => se.col || 1));
  };
  const getRows = (seats) => {
    if (!Array.isArray(seats) || seats.length === 0) return 0;
    return Math.max(...seats.map((se) => se.row || 1));
  };
  const newResponse = Object.entries(grouped).map(([floor, seats]) => ({
    floor: Number(floor),
    rows: getRows(seats),
    cols: getCols(seats),
    seats,
  }));
  return newResponse;
};

export const toggleSeatService = async (payload, userId) => {
  const existingSeat = await SeatSchedule.findOne({ seatId: payload.seatId });

  if (existingSeat) {
    if (existingSeat.userId.toString() !== userId.toString()) {
      const isHold = existingSeat.status === "hold";
      throwError(
        400,
        isHold
          ? SEAT_SCHEDULE_MESSAGE.BEING_HELD
          : SEAT_SCHEDULE_MESSAGE.BEING_BOOKED,
      );
    }
    if (existingSeat.status === "hold") {
      await existingSeat.deleteOne();
      const io = getIO();
      io.to(existingSeat.scheduleId.toString()).emit("seatUpdated", {
        seatId: existingSeat.seatId,
        scheduleId: existingSeat.scheduleId,
        status: "avaliable",
      });
      return { message: SEAT_SCHEDULE_MESSAGE.REMOVED_HELD };
    }
    if (existingSeat.status === "booked") {
      throwError(400, SEAT_SCHEDULE_MESSAGE.ALREADY_BOOKED);
    }
  }
  const count = await SeatSchedule.countDocuments({ userId });
  if (count === 4) {
    throwError(400, SEAT_SCHEDULE_MESSAGE.ONLY_HOLD_FOUR);
  }
  const seat = await SeatSchedule.create({ userId, ...payload });
  const io = getIO();
  io.to(payload.scheduleId.toString()).emit("seatUpdated", {
    seatId: seat.seatId,
    scheduleId: seat.scheduleId,
    status: seat.status,
  });
  return seat;
};
