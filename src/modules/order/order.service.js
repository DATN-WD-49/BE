import { throwError } from "../../common/utils/create-response.js";
import { queryBuilder } from "../../common/utils/query-builder.js";
import { createPaymentService } from "../payment/payment.service.js";
import { ORDER_MESSAGES } from "./order.message.js";
import Order from "./order.model.js";
import {
  checkAvaliableCar,
  checkAvaliableRoute,
  checkAvaliableSchedule,
  checkAvaliableSeat,
} from "./order.utils.js";

const populatedOrder = [
  {
    path: "carId",
    select: "-createdAt -updatedAt",
  },
  {
    path: "routeId",
    select: "-createdAt -updatedAt",
  },
  {
    path: "userId",
    select: "userName email phone",
  },
  {
    path: "scheduleId",
    select: "startTime arrivalTime crew",
  },
];

export const getAllOrderService = async (query) => {
  const orders = await queryBuilder(Order, query, { populate: populatedOrder });
  return orders;
};

export const getAllOrderByUserService = async (userId, query) => {
  const { data, meta } = await queryBuilder(Order, {
    userId: userId,
    ...query,
  });
  return { data, meta };
};

export const getDetailOrderService = async (id) => {
  const response = await Order.findById(id)
    .populate({
      path: "carId",
      select: "-createdAt -updatedAt",
    })
    .populate({
      path: "routeId",
      select: "-createdAt -updatedAt",
    })
    .populate({
      path: "userId",
      select: "userName email crew",
    })
    .populate({
      path: "scheduleId",
      select: "startTime arrivalTime phone",
    })
    .lean();
  if (!response) {
    throwError(400, ORDER_MESSAGES.ORDER_NOT_FOUND);
  }
  return response;
};

export const createOrderService = async (payload) => {
  const seatIds = payload.seats.map((seat) => seat.seatId);
  await checkAvaliableCar(payload.carId);
  await checkAvaliableRoute(payload.routeId);
  await checkAvaliableSchedule(payload.scheduleId);
  await checkAvaliableSeat(seatIds);
  const createdOrder = await Order.create(payload);
  const paymentData = await createPaymentService(createdOrder._id);
  return {
    order: createdOrder,
    checkoutUrl: paymentData.checkoutUrl,
  };
};

export const updateOrderService = async (id, payload) => {
  const updatedOrder = await Order.findByIdAndUpdate(id, payload, {
    new: true,
  });
  return updatedOrder;
};

export const comfirmOrderService = async (id, status = "USED") => {
  const response = await Order.findById(id);
  if (!response) {
    throwError(400, ORDER_MESSAGES.ORDER_NOT_FOUND);
  }
  if (response.isPaid === false) {
    throwError(400, ORDER_MESSAGES.ORDER_NOT_PAID);
  }
  response.status = status;
  await response.save();
  return response;
};
