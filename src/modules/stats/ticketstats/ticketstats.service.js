import dayjs from "dayjs";
import Order from "../../order/order.model.js";
import { convertQueryTime, resolveDateRanges } from "../stats.utils.js";

export const getOverviewTicketsService = async (query) => {
  const { current } = await resolveDateRanges(query?.createdAt || null);
  const [res] = await Order.aggregate([
    { $match: current },
    {
      $facet: {
        summary: [
          {
            $group: {
              _id: null,
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
        ],
        avgPerDay: [
          {
            $group: {
              _id: {
                day: {
                  $dateToString: {
                    format: "%Y-%m-%d",
                    date: "$createdAt",
                  },
                },
              },
              ticketsPerDay: {
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
          {
            $group: {
              _id: null,
              avgTicketsPerDay: { $avg: "$ticketsPerDay" },
            },
          },
        ],
        peakHour: [
          {
            $match: {
              isPaid: true,
              status: { $ne: "CANCELLED" },
            },
          },
          {
            $project: {
              hour: {
                $dateToString: {
                  format: "%H:00",
                  date: "$startTime",
                },
              },
            },
          },
          {
            $group: {
              _id: "$hour",
              totalTickets: { $sum: 1 },
            },
          },
          { $sort: { totalTickets: -1 } },
          { $limit: 1 },
        ],
        topRoute: [
          {
            $match: {
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
            },
          },
          { $sort: { totalTickets: -1 } },
          { $limit: 1 },
        ],
      },
    },
  ]);

  const peakH = res?.peakHour?.[0];
  const peakR = res?.topRoute?.[0];
  const queryTime = convertQueryTime(current);
  const avgTPDay = Math.round(res?.avgPerDay?.[0]?.avgTicketsPerDay || 0);

  return {
    totalTickets: res?.summary?.[0]?.totalTickets || 0,
    avgTicketsPerDay: avgTPDay,
    peakHour: peakH
      ? {
          hour: peakH._id,
          totalTickets: peakH.totalTickets,
        }
      : null,
    topRoute: peakR ? peakR._id : null,
    queryTime,
  };
};

export const getTicketHoursTrendService = async (query) => {
  const { current } = await resolveDateRanges(query?.createdAt || null);

  const rawData = await Order.aggregate([
    { $match: current },
    {
      $match: {
        isPaid: true,
        status: { $ne: "CANCELLED" },
      },
    },
    {
      $project: {
        hour: {
          $dateToString: {
            format: "%H:00",
            date: "$startTime",
          },
        },
      },
    },
    {
      $group: {
        _id: "$hour",
        totalTickets: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        hour: "$_id",
        totalTickets: 1,
      },
    },
    { $sort: { hour: 1 } },
  ]);
  const peakHour =
    rawData.length > 0
      ? rawData.reduce((max, cur) =>
          cur.totalTickets > max.totalTickets ? cur : max,
        )
      : null;

  return {
    rawData,
    peakHour,
    queryTime: convertQueryTime(current),
  };
};

export const getTicketHoursTodayService = async () => {
  const from = dayjs().startOf("day").toDate();
  const to = dayjs().endOf("day").add(1, "ms").toDate();

  const rawData = await Order.aggregate([
    {
      $match: {
        createdAt: {
          $gte: from,
          $lte: to,
        },
        isPaid: true,
        status: { $ne: "CANCELLED" },
      },
    },
    {
      $project: {
        hour: {
          $dateToString: {
            format: "%H:00",
            date: "$createdAt",
          },
        },
      },
    },
    {
      $group: {
        _id: "$hour",
        totalTickets: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        hour: "$_id",
        totalTickets: 1,
      },
    },
    { $sort: { hour: 1 } },
  ]);
  const hours = Array.from({ length: 24 }, (_, i) =>
    dayjs().hour(i).minute(0).format("HH:00"),
  );
  const data = hours.map((hour) => {
    const rawFound = rawData?.find?.((item) => item.hour === hour);
    return {
      hour,
      totalTickets: rawFound ? rawFound.totalTickets : 0,
    };
  });
  const peakHour =
    data.length > 0
      ? data.reduce((max, cur) =>
          cur.totalTickets > max.totalTickets ? cur : max,
        )
      : null;

  return {
    data,
    peakHour,
    queryTime: {
      from,
      to,
    },
  };
};

export const getTopRouteService = async (query) => {
  const { current } = await resolveDateRanges(query?.createdAt || null);

  const data = await Order.aggregate([
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
      },
    },
    {
      $lookup: {
        from: "schedules",
        let: { routeId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  {
                    $eq: [{ $toObjectId: "$routeId" }, "$$routeId"],
                  },
                  { $eq: ["$status", "completed"] },
                ],
              },
            },
          },
          { $count: "totalSchedules" },
        ],
        as: "scheduleStats",
      },
    },
    {
      $addFields: {
        totalSchedules: {
          $ifNull: [{ $arrayElemAt: ["$scheduleStats.totalSchedules", 0] }, 0],
        },
      },
    },
    {
      $project: {
        scheduleStats: 0,
      },
    },
    { $sort: { totalTickets: -1 } },
    { $limit: 5 },
  ]);

  const totalTickets = data.reduce((s, i) => s + (i.totalTickets || 0), 0);

  if (!totalTickets) {
    return {
      totalTickets: 0,
      data: [],
      queryTime: convertQueryTime(current),
    };
  }

  return {
    totalTickets: totalTickets,
    topRoute: data,
    queryTime: convertQueryTime(current),
  };
};

export const getTopCarService = async (query) => {
  const { current } = await resolveDateRanges(query?.createdAt || null);

  const data = await Order.aggregate([
    {
      $match: {
        ...current,
        isPaid: true,
        status: { $ne: "CANCELLED" },
      },
    },
    {
      $lookup: {
        from: "cars",
        let: { carId: { $toObjectId: "$carId" } },
        pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$carId"] } } }],
        as: "carInfo",
      },
    },
    { $unwind: "$carInfo" },
    {
      $group: {
        _id: "$carId",
        licensePlate: { $first: "$carInfo.licensePlate" },
        totalTickets: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: "schedules",
        let: { carId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  {
                    $eq: [{ $toObjectId: "$carId" }, "$$carId"],
                  },
                  { $eq: ["$status", "completed"] },
                ],
              },
            },
          },
          { $count: "totalSchedules" },
        ],
        as: "scheduleStats",
      },
    },
    {
      $addFields: {
        totalSchedules: {
          $ifNull: [{ $arrayElemAt: ["$scheduleStats.totalSchedules", 0] }, 0],
        },
      },
    },
    {
      $project: {
        scheduleStats: 0,
      },
    },
    { $sort: { totalTickets: -1 } },
    { $limit: 5 },
  ]);

  const totalTickets = data.reduce((s, i) => s + (i.totalTickets || 0), 0);

  if (!totalTickets) {
    return {
      totalTickets: 0,
      data: [],
      queryTime: convertQueryTime(current),
    };
  }

  return {
    totalTickets: totalTickets,
    topCar: data,
    queryTime: convertQueryTime(current),
  };
};
