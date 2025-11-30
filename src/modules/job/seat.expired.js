import dayjs from "dayjs";
import SeatSchedule from "../seat-schedule/seat-schedule.model.js";
import { getIO } from "../../socket/socket.instance.js";
import cron from "node-cron";

export const cleanExpiredSeats = async () => {
  try {
    const now = dayjs.toDate();
    const expiredSeats = await SeatSchedule.find({
      status: "hold",
      expiredHold: { $lt: now },
    });
    if (expiredSeats.length > 0) {
      const scheduleIds = expiredSeats.map((seat) =>
        seat.scheduleId.toString(),
      );
      const ressult = await SeatSchedule.deleteMany({
        _id: { $in: expiredSeats.map((seat) => seat._id) },
      });
      console.log(
        `[${dayjs().format("YYYY-MM-DD HH:mm:ss")}] Deleted ${ressult.deletedCount} expired hold seats.`,
      );
      const io = getIO();
      scheduleIds.forEach((scheduleId) => {
        io.to(scheduleId).emit("seatUpdated", {
          message: "Some held seats have expired",
          deletedCount: ressult.deletedCount,
          timestamp: dayjs().toISOString(),
        });
      });
    }
  } catch (err) {
    console.error(err);
  }
};

export const startSeatExpiredJob = () => {
  console.log("✓ Seat clean job started.");
  const task = cron.schedule("* * * * *", async () => {
    console.log("✓ Seat clean runtime");
    await cleanExpiredSeats();
  });
  return task;
};
