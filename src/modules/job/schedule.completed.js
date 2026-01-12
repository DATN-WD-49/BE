import dayjs from "dayjs";
import { getIO } from "../../socket/socket.instance.js";
import cron from "node-cron";
import Schedule from "../schedule/schedule.model.js";

export const completedSchedules = async () => {
  try {
    const now = dayjs().toDate();
    const completingSchedules = await Schedule.find({
      status: "running",
      arrivalTime: { $lte: now },
    });
    if (completingSchedules.length > 0) {
      const scheduleIds = completingSchedules.map((schedule) =>
        schedule._id.toString(),
      );
      const ressult = await Schedule.updateMany(
        {
          _id: { $in: completingSchedules.map((seat) => seat._id) },
        },
        [
          {
            $set: {
              status: "completed",
            },
          },
        ],
      );
      console.log(
        `[${dayjs().format("YYYY-MM-DD HH:mm:ss")}] Completed ${ressult.modifiedCount} pending Schedules.`,
      );
      const io = getIO();
      scheduleIds.forEach((scheduleId) => {
        io.to(scheduleId).emit("Schedule Completed", {
          message: "Some Schedule has Completed",
          updateCount: ressult.modifiedCount,
          timestamp: dayjs().toISOString(),
        });
      });
    }
  } catch (err) {
    console.error(err);
  }
};

export const startcompletedSchedulesJob = () => {
  console.log("✓ Schedule Completed job started.");
  const task = cron.schedule("* * * * *", async () => {
    console.log("✓ Schedule Completed runtime");
    await completedSchedules();
  });
  return task;
};
