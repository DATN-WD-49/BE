import dayjs from "dayjs";
import { throwError } from "../../common/utils/create-response.js";
import { queryBuilder } from "../../common/utils/query-builder.js";
import Car from "../car/car.model.js";
import Route from "../route/route.model.js";
import { SCHEDULE_MESSAGES } from "./schedule.messages.js";
import Schedule from "./schedule.model.js";
import {
  checkConflictTime,
  groupedSchedules,
  getArrivalTime,
} from "./schedule.utils.js";

const populatedSchedule = [
  {
    path: "carId",
    select: "-createdAt -updatedAt",
  },
  {
    path: "routeId",
    select: "-createdAt -updatedAt",
  },
  {
    path: "crew.userId",
    select: "userName email phone",
  },
];

export const getAllScheduleService = async (query) => {
  const { groupSchedule, ...otherQuery } = query;
  const schedules = await queryBuilder(
    Schedule,
    {
      disablePagination: groupSchedule ? true : false,
      ...otherQuery,
    },
    { populate: populatedSchedule },
  );
  if (groupSchedule) {
    return groupedSchedules(schedules.data, query);
  }
  return schedules;
};

export const getDetailScheduleService = async (id) => {
  const response = await Schedule.findById(id)
    .populate({ path: "carId", select: "-createdAt -updatedAt" })
    .populate({ path: "routeId", select: "-createdAt -updatedAt" })
    .lean();
  if (!response) {
    throwError(400, SCHEDULE_MESSAGES.NOT_FOUND_SCHEDULE);
  }
  return response;
};

export const createScheduleService = async (payload) => {
  const { carId, routeId, startTime, crew } = payload;
  //carId, routeId sẽ được chọn như thế nào?
  const startT = new Date(startTime);
  const backupTime = 0;
  const arrivalT = await getArrivalTime(routeId, startT, backupTime);
  const crewIds = crew.map((cr) => cr.userId);
  const scheduleConflict = await checkConflictTime(
    carId,
    crewIds,
    startT,
    arrivalT,
  );
  if (scheduleConflict) {
    throwError(400, scheduleConflict.message);
  }
  payload.arrivalTime = arrivalT;
  const createdSchedule = await Schedule.create({
    dayOfWeek: startT.getDay(),
    ...payload,
  });
  return createdSchedule;
};

export const createManyScheduleService = async (payload) => {
  const { carId, routeId, startTime, untilTime, weekdays } = payload;
  const beginTime = new Date(startTime);
  const beginTimeHour = beginTime.getHours();
  const beginTimeMinute = beginTime.getMinutes();
  const untilendTime = new Date(untilTime);
  const backupTime = 2;

  const createdSchedules = [];
  const failedSchedules = [];

  let curentScheduleStartTime = new Date(beginTime);

  while (curentScheduleStartTime <= untilendTime) {
    let checkweekday = dayjs(curentScheduleStartTime);
    if (!weekdays || weekdays.includes(checkweekday.day())) {
      const newPayload = { ...payload };
      newPayload.startTime = new Date(curentScheduleStartTime);
      newPayload.arrivalTime = await getArrivalTime(
        routeId,
        new Date(curentScheduleStartTime),
        backupTime,
      );
      delete newPayload.untilTime;

      const conflictSchedule = await checkConflictTime(
        carId,
        newPayload.startTime,
        newPayload.arrivalTime,
      );

      if (conflictSchedule) {
        failedSchedules.push(newPayload);
      } else {
        createdSchedules.push(newPayload);
      }

      curentScheduleStartTime = new Date(
        newPayload.arrivalTime.getFullYear(),
        newPayload.arrivalTime.getMonth(),
        newPayload.arrivalTime.getDate(),
        beginTimeHour,
        beginTimeMinute,
        0,
        0,
      );
      curentScheduleStartTime.setDate(curentScheduleStartTime.getDate() + 1);
      console.log(curentScheduleStartTime);
    } else {
      curentScheduleStartTime.setDate(curentScheduleStartTime.getDate() + 1);
    }
  }

  return { createdSchedules, failedSchedules };
};

export const updateScheduleService = async (id, payload) => {
  const { carId, routeId, startTime, crew } = payload;
  const startT = new Date(startTime);
  const backupTime = 0;
  const arrivalT = await getArrivalTime(routeId, startT, backupTime);
  const crewIds = crew.map((cr) => cr.userId);
  const scheduleConflict = await checkConflictTime(
    carId,
    crewIds,
    startT,
    arrivalT,
    id,
  );
  if (scheduleConflict) {
    throwError(400, SCHEDULE_MESSAGES.CONFLICT_SCHEDULE(scheduleConflict));
    //có nên làm cái gì đấy để người dùng chọn giữ cái nào không?
  }
  payload.arrivalTime = arrivalT;
  // Nếu như schedule này đã có người đặt thì sao?
  if (payload.status === "cancelled") {
    payload.isDisable = true;
    payload.disableBy = "handle";
  }
  const updated = await Schedule.findByIdAndUpdate(id, payload, { new: true });
  return updated;
};

export const updateStatusScheduleService = async (id) => {
  const schedule = await Schedule.findById(id).lean();
  if (!schedule) throwError(400, SCHEDULE_MESSAGES.NOT_FOUND_SCHEDULE);
  const { status, carId, routeId, startTime, arrivalTime, isDisable } =
    schedule;
  if (!status) {
    const [conflict, route, car] = await Promise.all([
      checkConflictTime(carId, startTime, arrivalTime, id),
      Route.findById(routeId).lean(),
      Car.findById(carId).lean(),
    ]);
    checkConflictTime(carId, startTime, arrivalTime, id);
    if (conflict) throwError(400, SCHEDULE_MESSAGES.CONFLICT_SCHEDULE);
    if (!route || !route.status)
      throwError(400, SCHEDULE_MESSAGES.ROUTE_NOT_AVAILABLE);
    if (!car || !car.status)
      throwError(400, SCHEDULE_MESSAGES.CAR_NOT_AVAILABLE);
  }
  // Nếu như schedule này đã có người đặt thì sao?
  const updated = await Schedule.findByIdAndUpdate(
    id,
    { $set: { status: !status, isDisable: !isDisable } },
    { new: true },
  );
  return updated;
};

export const updateStatusManySchedule = async (
  filterKey,
  filterValue,
  newStatus,
) => {
  const schedules = await Schedule.find({
    [filterKey]: filterValue,
    isDisable: { $ne: true },
  }).lean();
  if (!schedules?.length) throwError(400, SCHEDULE_MESSAGES.NOT_FOUND_SCHEDULE);

  if (!newStatus) {
    return await Schedule.updateMany(
      { [filterKey]: filterValue },
      { $set: { status: false } },
    );
  }

  const results = await Promise.allSettled(
    schedules.map(
      async ({ _id, carId, routeId, startTime, arrivalTime, isDisable }) => {
        const [conflict, route, car] = await Promise.all([
          checkConflictTime(carId, startTime, arrivalTime, _id),
          Route.findById(routeId).lean(),
          Car.findById(carId).lean(),
        ]);

        if (conflict)
          throwError(400, SCHEDULE_MESSAGES.CONFLICT_SCHEDULE(conflict));
        if (!route?.status)
          throwError(400, SCHEDULE_MESSAGES.ROUTE_NOT_AVAILABLE);
        if (!car?.status) throwError(400, SCHEDULE_MESSAGES.CAR_NOT_AVAILABLE);
        if (!isDisable) {
          await Schedule.findByIdAndUpdate(_id, { $set: { status: true } });
        }
        return _id;
      },
    ),
  );

  return results;
};
