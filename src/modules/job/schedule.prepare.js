import dayjs from "dayjs";
import { getIO } from "../../socket/socket.instance.js";
import cron from "node-cron";
import Schedule from "../schedule/schedule.model.js";

export const prepareSchedules = async () => {
  try {
    const twoHoursAgo = dayjs().add(2, "hour").toDate();
    const prepareSchedules = await Schedule.find({
      status: "pending",
      startTime: { $lte: twoHoursAgo },
    });
    if (prepareSchedules.length > 0) {
      const scheduleIds = prepareSchedules.map((schedule) =>
        schedule._id.toString(),
      );
      const ressult = await Schedule.updateMany(
        {
          _id: { $in: prepareSchedules.map((seat) => seat._id) },
        },
        [
          {
            $set: {
              status: {
                $cond: [{ $eq: ["$isDisable", true] }, "cancelled", "prepared"],
              },
            },
          },
        ],
      );
      console.log(ressult);
      console.log(
        `[${dayjs().format("YYYY-MM-DD HH:mm:ss")}] Updated ${ressult.modifiedCount} pending Schedules.`,
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

export const startprepareSchedulesJob = () => {
  console.log("✓ Schedule Update job started.");
  const task = cron.schedule("* * * * *", async () => {
    console.log("✓ Schedule Update runtime");
    await prepareSchedules();
  });
  return task;
};
