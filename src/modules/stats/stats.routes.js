import { Router } from "express";
import { getOverview, getOverviewByMonth } from "./stats.controller.js";
import ticketStatsRoute from "./ticketstats/ticketstats.routes.js";

const statsRoute = Router();

statsRoute.get("/overview", getOverview);
statsRoute.get("/overview/month-of-year", getOverviewByMonth);
statsRoute.use("/ticket", ticketStatsRoute);

export default statsRoute;
