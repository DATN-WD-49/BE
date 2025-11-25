import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore.js";
import Route from "../route/route.model.js";
import { SCHEDULE_MESSAGES } from "./schedule.messages.js";
import Schedule from "./schedule.model.js";
import "dayjs/locale/vi.js";
dayjs.extend(isSameOrBefore);
dayjs.locale("vi");

export const checkConflictTime = async (
  carId,
  crewIds = [],
  startT,
  endT,
  excludeId = null,
) => {
  const condition = {
    $or: [{ carId }, { "crew.userId": { $in: crewIds } }],
    isDisable: false,
    startTime: { $lte: endT },
    arrivalTime: { $gte: startT },
  };
  if (excludeId) condition._id = { $ne: excludeId };
  const conflict = await Schedule.findOne(condition)
    .populate("carId")
    .populate("crew.userId")
    .populate("routeId");
  if (!conflict) return null;
  if (conflict.carId._id.toString() === carId.toString()) {
    return {
      ...conflict.toObject(),
      message: SCHEDULE_MESSAGES.CAR_CONFLICT(conflict),
    };
  }
  const busyUsers = conflict.crew
    .filter((cr) => crewIds.includes(cr.userId?._id.toString()))
    .map((c) => ({ userName: c.userId.userName, role: c.role }));
  if (busyUsers.length > 0) {
    return {
      ...conflict.toObject(),
      message: SCHEDULE_MESSAGES.CREW_CONFLICT(conflict, busyUsers),
    };
  }
  return conflict;
};

export const generateManySchedules = async (payload) => {
  const { carId, routeId, startTime, untilTime, crew, dayOfWeek, fixedHour } =
    payload;
  const startDay = dayjs(startTime);
  const endDay = dayjs(untilTime);

  const createdSchedules = [];
  const failedSchedules = [];
  const route = await Route.findById(routeId).lean();
  const { duration } = route;

  let currentStart = startDay.clone();
  console.log("currentStart:", currentStart);
  console.log("is dayjs?", typeof currentStart.isSameOrBefore);
  const resetTime = (dat) => {
    const date = dat.clone();
    if (fixedHour) {
      return date
        .hour(fixedHour.hour)
        .minute(fixedHour.minute)
        .second(fixedHour.second || 0);
    }
    return date
      .hour(startDay.hour())
      .minute(startDay.minute())
      .second(startDay.second() || 0);
  };
  while (currentStart.isSameOrBefore(endDay, "day")) {
    const currentDay = currentStart.day();
    if (!dayOfWeek.includes(currentDay)) {
      currentStart = resetTime(currentStart.clone().add(1, "day"));
      continue;
    }
    const startT = resetTime(currentStart.clone());
    const arrivalT = startT.clone().add(duration, "hour");
    const crewIds = crew.map((item) => item.userId);
    const conflict = await checkConflictTime(
      carId,
      crewIds,
      startT.toDate(),
      arrivalT.toDate(),
    );
    if (!conflict) {
      createdSchedules.push({
        ...payload,
        startTime: startT.toDate(),
        arrivalTime: arrivalT.toDate(),
        dayOfWeek: currentDay,
      });
    }
    if (conflict) {
      failedSchedules.push(conflict);
    }
    currentStart = resetTime(currentStart.clone().add(1, "day"));
  }
  return { createdSchedules, failedSchedules };
};

export const groupedSchedules = (schedules, query) => {
  const groupSchedules = new Map();
  for (const schedule of schedules) {
    const dayOfWeek = new Date(schedule.startTime).getDay();
    const key = `${schedule.carId._id} - ${schedule.routeId._id}`;
    const existing = groupSchedules.get(key);
    const allStatus = [
      "pending",
      "confirmed",
      "running",
      "completed",
      "pendingCancel",
      "cancelled",
    ];
    const mergedPending = ["pending", "confirmed", "running"];
    const statusCount = Object.fromEntries(
      allStatus.map((sta) => {
        if (sta === "pending") {
          return ["pending", mergedPending.includes(schedule.status) ? 1 : 0];
        }
        return [sta, schedule.status === sta ? 1 : 0];
      }),
    );
    if (existing) {
      existing.count++;
      existing.activeCount += schedule.isDisable === false ? 1 : 0;
      existing.inActiveCount += schedule.isDisable === true ? 1 : 0;
      existing.statusCount[schedule.status] =
        (existing.statusCount[schedule.status] || 0) + 1;
      if (!existing.dayOfWeek.includes(dayOfWeek)) {
        existing.dayOfWeek.push(dayOfWeek);
        existing.dayOfWeek.sort((a, b) => {
          if (a === 0) return 1;
          if (b === 0) return -1;
          return a - b;
        });
      }
    } else {
      groupSchedules.set(key, {
        ...schedule.toObject(),
        count: 1,
        statusCount: statusCount,
        activeCount: schedule.isDisable === false ? 1 : 0,
        inActiveCount: schedule.isDisable === true ? 1 : 0,
        dayOfWeek: [dayOfWeek],
      });
    }
  }
  const groupedArray = [...groupSchedules.values()];
  const page = Number(query?.page || 1);
  const limit = Number(query?.limit || 10);
  const start = (page - 1) * limit;
  const end = start + limit;
  const paginatedData = groupedArray.slice(start, end);

  return {
    data: paginatedData,
    meta: {
      page,
      limit,
      total: groupedArray.length,
      totalPages: Math.ceil(groupedArray.length / limit),
    },
  };
};

export const getArrivalTime = async (routeID, startTime, backupTime) => {
  const startT = new Date(startTime);
  const { duration } = await Route.findById(routeID);
  const arrivalT = new Date(
    startT.getTime() + (duration + backupTime) * 3600000,
  );
  return arrivalT;
};
