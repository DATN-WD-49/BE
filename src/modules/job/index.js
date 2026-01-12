import { startOrdersExpiredJob } from "./order.expired.js";
import { startcompletedSchedulesJob } from "./schedule.completed.js";
import { startprepareSchedulesJob } from "./schedule.prepare.js";
import { startRunningSchedulesJob } from "./schedule.running.js";
import { startSeatExpiredJob } from "./seat.expired.js";
import { startLockUsersExpiredJob } from "./user.lock.expired.js";

export const startJob = () => {
  startSeatExpiredJob();
  startOrdersExpiredJob();
  startprepareSchedulesJob();
  startRunningSchedulesJob();
  startcompletedSchedulesJob();
  startLockUsersExpiredJob();
};
