import dayjs from "dayjs";
import handleAsync from "../../common/utils/async-handler.js";
import createResponse from "../../common/utils/create-response.js";
import { applyFilter } from "../../common/utils/query-builder.js";
import {
  getOverviewByMonthService,
  getOverviewService,
} from "./stats.service.js";
import { applyQuickDateFilter } from "./stats.utils.js";

export const getOverview = handleAsync(async (req, res) => {
  const match = {};
  Object.entries(req.query).forEach(([key, value]) =>
    applyFilter(key, value, match),
  );
  if (match.quickFilter) {
    const { createdFrom, createdTo } = applyQuickDateFilter(
      req.query.quickFilter,
    );
    match.createdAt = {
      $gte: createdFrom,
      $lte: createdTo,
    };
    delete match.quickFilter;
  }
  const data = await getOverviewService(match);
  return createResponse(res, 200, "OK", data);
});

export const getOverviewByMonth = handleAsync(async (req, res) => {
  const yearQuery = req.query.year ? Number(req.query.year) : dayjs().year();
  const startYear = dayjs().year(yearQuery).startOf("year");
  const endYear = dayjs().year(yearQuery).endOf("year");
  const data = await getOverviewByMonthService({
    $gte: startYear.toDate(),
    $lte: endYear.toDate(),
  });
  const startMonth = startYear;
  const result = Array.from({ length: 12 }, (_, i) => {
    const monthKey = startMonth.add(i, "month").format("YYYY-MM");
    const monthFound = data.find((r) => r.month === monthKey);

    return {
      month: monthKey,
      revenue: monthFound?.revenue ?? 0,
      tickets: monthFound?.tickets ?? 0,
    };
  });
  return createResponse(res, 200, "OK", { year: yearQuery, result });
});
