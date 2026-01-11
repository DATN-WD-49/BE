import dayjs from "dayjs";
import Order from "../order/order.model.js";
import User from "../user/user.model.js";

export const getAggregateOverviewTicket = async (mat) => {
  const [res] = await Order.aggregate([
    { $match: mat },
    {
      $group: {
        _id: null,
        totalRevenue: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $ne: ["$status", "CANCELLED"] },
                  { $eq: ["$isPaid", true] },
                ],
              },
              "$totalPrice",
              0,
            ],
          },
        },
        totalTickets: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $ne: ["$status", "CANCELLED"] },
                  { $eq: ["$isPaid", true] },
                ],
              },
              1,
              0,
            ],
          },
        },
      },
    },
  ]);

  return {
    totalTickets: res?.totalTickets || 0,
    totalRevenue: res?.totalRevenue || 0,
  };
};

export const getAggregateOverviewUser = async (mat) => {
  const [res] = await User.aggregate([
    {
      $match: {
        ...mat,
        isVerified: true,
        isLocked: false,
      },
    },
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
      },
    },
  ]);
  return {
    totalUsers: res?.totalUsers || 0,
  };
};

export const resolveDateRanges = async (createdAt, field = "createdAt") => {
  const currentDateRanges =
    createdAt?.$gte && createdAt.$lte
      ? {
          from: dayjs(createdAt.$gte),
          to: dayjs(createdAt.$lte),
        }
      : {
          from: dayjs().startOf("month"),
          to: dayjs().endOf("month"),
        };
  const diffD = currentDateRanges.to.diff(currentDateRanges.from, "day") + 1;

  const previousDateFrom = currentDateRanges.from
    .subtract(diffD, "day")
    .startOf("day");
  const previousDateTo = currentDateRanges.from.subtract(1, "day").endOf("day");

  return {
    current: {
      [field]: {
        $gte: currentDateRanges.from.toDate(),
        $lte: currentDateRanges.to.toDate(),
      },
    },
    previous: {
      [field]: {
        $gte: previousDateFrom.toDate(),
        $lte: previousDateTo.toDate(),
      },
    },
  };
};

export const calcGrowth = (current, previous) => {
  if (previous === 0 && current > 0) return 100;
  if (current === 0) return 0;
  return Number((((current - previous) / previous) * 100).toFixed(1));
};

export const applyQuickDateFilter = (qFilter) => {
  const now = dayjs();

  switch (qFilter) {
    case "today":
      return {
        createdFrom: now.startOf("day").toISOString(),
        createdTo: now.endOf("day").toISOString(),
      };
    case "yesterday":
      return {
        createdFrom: now.subtract(1, "day").startOf("day").toISOString(),
        createdTo: now.subtract(1, "day").endOf("day").toISOString(),
      };
    case "weekAgo":
      return {
        createdFrom: now.subtract(7, "day").toISOString(),
        createdTo: now.toISOString(),
      };
    case "monthAgo":
      return {
        createdFrom: now.subtract(1, "month").startOf("day").toISOString(),
        createdTo: now.toISOString(),
      };
    case "thisYear":
      return {
        createdFrom: now.startOf("year").toISOString(),
        createdTo: now.toISOString(),
      };
    default:
      return null;
  }
};

export const convertQueryTime = (range, field = "createdAt") => {
  if (!range[field]) return null;

  return {
    from: range[field].$gte || null,
    to: range[field].$lte || null,
  };
};
