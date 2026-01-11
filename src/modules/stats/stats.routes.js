import { Router } from "express";
import {
  getOverview,
  getOverviewByMonth,
  getTopRevenueRoute,
} from "./stats.controller.js";
import ticketStatsRoute from "./ticketstats/ticketstats.routes.js";

const statsRoute = Router();

statsRoute.get("/overview", getOverview);
statsRoute.get("/overview/month-of-year", getOverviewByMonth);
statsRoute.get("/overview/revenue-route", getTopRevenueRoute);

statsRoute.use("/ticket", ticketStatsRoute);

export default statsRoute;
