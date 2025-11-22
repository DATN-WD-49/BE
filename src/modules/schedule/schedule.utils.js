import Route from "../route/route.model.js";
import Schedule from "./schedule.model.js";

export const checkConflictTime = async (
  carId,
  startTime,
  endTime,
  excludeId = null,
) => {
  const startT = new Date(startTime);
  const endT = new Date(endTime);
  const condition = {
    carId: carId,
    status: true,
    startTime: { $lte: endT },
    arrivalTime: { $gte: startT },
  };
  if (excludeId) condition._id = { $ne: excludeId };
  const conflict = await Schedule.findOne(condition);
  return conflict;
};

export const getArrivalTime = async (routeID, startTime, backupTime) => {
  const startT = new Date(startTime);
  const { duration } = await Route.findById(routeID);
  const arrivalT = new Date(
    startT.getTime() + (duration + backupTime) * 3600000,
  );
  return arrivalT;
  //có thể làm thành api sau này...
};
