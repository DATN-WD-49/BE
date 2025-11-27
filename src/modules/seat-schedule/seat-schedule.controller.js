import { ROOT_MESSAGES } from "../../common/constants/messages";
import handleAsync from "../../common/utils/async-handler.js";
import createResponse from "../../common/utils/create-response.js";
import { getSeatScheduleService } from "./seat-schedule.service.js";

export const getSeatSchedule = handleAsync(async (req, res) => {
  const { carId, scheduleId } = req.params;
  const seats = await getSeatScheduleService(carId, scheduleId);
  return createResponse(res, 200, ROOT_MESSAGES.OK, seats);
});
