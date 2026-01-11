import { Router } from "express";
import {
  getOverviewTickets,
  getTicketHoursToday,
  getTicketHoursTrend,
  getTopCar,
  getTopRoute,
} from "./ticketstats.controller.js";

const ticketStatsRoute = Router();

ticketStatsRoute.get("/", getOverviewTickets);
ticketStatsRoute.get("/trend", getTicketHoursTrend);
ticketStatsRoute.get("/trend-today", getTicketHoursToday);
ticketStatsRoute.get("/top-car", getTopCar);
ticketStatsRoute.get("/top-route", getTopRoute);

export default ticketStatsRoute;
