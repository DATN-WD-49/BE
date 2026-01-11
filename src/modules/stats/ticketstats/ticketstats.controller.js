import handleAsync from "../../../common/utils/async-handler.js";
import createResponse from "../../../common/utils/create-response.js";
import { applyFilter } from "../../../common/utils/query-builder.js";
import { applyQuickDateFilter } from "../stats.utils.js";
import {
  getOverviewTicketsService,
  getTicketHoursTodayService,
  getTicketHoursTrendService,
  getTopCarService,
  getTopRouteService,
} from "./ticketstats.service.js";

export const getOverviewTickets = handleAsync(async (req, res) => {
  const match = {};
  Object.entries(req.query).forEach(([key, value]) =>
    applyFilter(key, value, match),
  );
  const data = await getOverviewTicketsService(match);
  return createResponse(res, 200, "OK", data);
});

export const getTicketHoursTrend = handleAsync(async (req, res) => {
  const match = {};
  Object.entries(req.query).forEach(([key, value]) =>
    applyFilter(key, value, match),
  );
  const data = await getTicketHoursTrendService(match);
  return createResponse(res, 200, "OK", data);
});

export const getTicketHoursToday = handleAsync(async (req, res) => {
  const data = await getTicketHoursTodayService();
  return createResponse(res, 200, "OK", data);
});

export const getTopRoute = handleAsync(async (req, res) => {
  const match = {};
  Object.entries(req.query).forEach(([key, value]) =>
    applyFilter(key, value, match),
  );
  const data = await getTopRouteService(match);
  return createResponse(res, 200, "OK", data);
});

export const getTopCar = handleAsync(async (req, res) => {
  const match = {};
  Object.entries(req.query).forEach(([key, value]) =>
    applyFilter(key, value, match),
  );
  const data = await getTopCarService(match);
  return createResponse(res, 200, "OK", data);
});
