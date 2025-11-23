import dayjs from "dayjs";
import Route from "../route/route.model.js";
import { SCHEDULE_MESSAGES } from "./schedule.messages.js";
import Schedule from "./schedule.model.js";

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
  let currentStart = startDay;
  const resetTime = (date) => {
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
      currentStart = resetTime(currentStart.add(1, "day"));
      continue;
    }
    const startT = resetTime(currentStart);
    const arrvialT = startT.add(duration, "hour");
    const crewIds = crew.map((item) => item.userId);
    const conflict = await checkConflictTime(
      carId,
      crewIds,
      startT.toDate(),
      arrvialT.toDate(),
    );
    if (!conflict) {
      createdSchedules.push({
        ...payload,
        startTime: startT.toDate(),
        arrivalTime: arrvialT.toDate(),
        dayOfWeek: currentDay,
      });
    }
    if (conflict) {
      failedSchedules.push(conflict);
    }
    currentStart = resetTime(currentStart.add(1, "day"));
  }
  return { createdSchedules, failedSchedules };
};
