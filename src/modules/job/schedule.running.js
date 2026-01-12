import dayjs from "dayjs";
import { getIO } from "../../socket/socket.instance.js";
import cron from "node-cron";
import Schedule from "../schedule/schedule.model.js";

export const runningSchedules = async () => {
  try {
    const now = dayjs().toDate();
    const runningSchedules = await Schedule.find({
      status: "prepared",
      startTime: { $lte: now },
    });
    if (runningSchedules.length > 0) {
      const scheduleIds = runningSchedules.map((schedule) =>
        schedule._id.toString(),
      );
      const ressult = await Schedule.updateMany(
        {
          _id: { $in: runningSchedules.map((seat) => seat._id) },
        },
        [
          {
            $set: {
              status: "running",
            },
          },
        ],
      );
      console.log(ressult);
      console.log(
        `[${dayjs().format("YYYY-MM-DD HH:mm:ss")}] Updated ${ressult.modifiedCount} prepare Schedules.`,
      );
      const io = getIO();
      scheduleIds.forEach((scheduleId) => {
        io.to(scheduleId).emit("Schedule Updated", {
          message: "Some Schedule has updated",
          updateCount: ressult.modifiedCount,
          timestamp: dayjs().toISOString(),
        });
      });
    }
  } catch (err) {
    console.error(err);
  }
};

export const startRunningSchedulesJob = () => {
  console.log("✓ Schedule Running job started.");
  const task = cron.schedule("* * * * *", async () => {
    console.log("✓ Schedule Running runtime");
    await runningSchedules();
  });
  return task;
};
