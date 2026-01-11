import Order from "../order/order.model.js";
import {
  calcGrowth,
  getAggregateOverviewTicket,
  getAggregateOverviewUser,
  resolveDateRanges,
} from "./stats.utils.js";

export const getOverviewService = async (query) => {
  const { current, previous } = await resolveDateRanges(query.createdAt);
  //đoạn này đang bị lỗi
  const { createdAt, ...rest } = query;
  console.log(current, previous);
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
