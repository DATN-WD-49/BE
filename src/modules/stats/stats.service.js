import Order from "../order/order.model.js";
import {
  calcGrowth,
  convertQueryTime,
  getAggregateOverviewTicket,
  getAggregateOverviewUser,
  resolveDateRanges,
} from "./stats.utils.js";

export const getOverviewService = async (query) => {
  const { current, previous } = await resolveDateRanges(query?.createdAt);
  const { createdAt, ...rest } = query;
  const [currentS, previousS] = await Promise.all([
    getAggregateOverviewTicket({
      ...rest,
      ...current,
    }),
    getAggregateOverviewTicket({
      ...rest,
      ...previous,
    }),
  ]);
  const [currentU, previousU] = await Promise.all([
    getAggregateOverviewUser({
      ...rest,
      ...current,
    }),
    getAggregateOverviewUser({
      ...rest,
      ...previous,
    }),
  ]);

  const queryTimeC = convertQueryTime(current);
  const queryTimeP = convertQueryTime(previous);

  return {
    tickets: {
      totalCurrent: currentS.totalTickets,
      totalPrevious: previousS.totalTickets,
      growthPercents: calcGrowth(currentS.totalTickets, previousS.totalTickets),
    },
    revenue: {
      totalCurrent: currentS.totalRevenue,
      totalPrevious: previousS.totalRevenue,
      growthPercents: calcGrowth(currentS.totalRevenue, previousS.totalRevenue),
    },
    newUsers: {
      totalCurrent: currentU.totalUsers,
      totalPrevious: previousU.totalUsers,
      growthPercents: calcGrowth(currentU.totalUsers, previousU.totalUsers),
    },
    queryTimes: {
      current: queryTimeC,
      previous: queryTimeP,
    },
  };
};

export const getOverviewByMonthService = async (query) => {
  const rawResult = await Order.aggregate([
    {
      $match: {
        createdAt: query,
        isPaid: true,
        status: { $ne: "CANCELLED" },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: "%Y-%m",
            date: "$createdAt",
            timezone: "Asia/Ho_Chi_Minh",
          },
        },
        revenue: { $sum: "$totalPrice" },
        tickets: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        month: "$_id",
        revenue: 1,
        tickets: 1,
      },
    },
    { $sort: { month: 1 } },
  ]);

  return rawResult;
};

export const getTopRevenueRouteService = async (query) => {
  const { current } = await resolveDateRanges(query?.createdAt);
  const rawData = await Order.aggregate([
    {
      $match: {
        ...current,
        isPaid: true,
        status: { $ne: "CANCELLED" },
      },
    },
    {
      $lookup: {
        from: "routes",
        let: { routeId: { $toObjectId: "$routeId" } },
        pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$routeId"] } } }],
        as: "routeInfo",
      },
    },
    { $unwind: "$routeInfo" },
    {
      $group: {
        _id: "$routeId",
        pickupPoint: { $first: "$routeInfo.pickupPoint.label" },
        dropPoint: { $first: "$routeInfo.dropPoint.label" },
        totalTickets: { $sum: 1 },
        revenue: { $sum: "$totalPrice" },
        totalTickets: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        routeId: "$_id",
        pickupPoint: 1,
        dropPoint: 1,
        revenue: 1,
        totalTickets: 1,
      },
    },
    { $sort: { revenue: -1, totalTickets: -1 } },
    { $limit: 5 },
  ]);
  return {
    result: rawData,
    queryTime: convertQueryTime(current),
  };
};
