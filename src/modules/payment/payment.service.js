import Order from "../order/order.model.js";
import { throwError } from "../../common/utils/create-response.js";
import { ORDER_MESSAGES } from "../order/order.message.js";
import { PayOS } from "@payos/node";
import { unholdSeatService } from "../seat-schedule/seat-schedule.service.js";
import { updateBookedSeats } from "../seat-schedule/seat-schedule.utils.js";
import Schedule from "../schedule/schedule.model.js";

const payos = new PayOS({
  clientId: process.env.PAYOS_CLIENT_ID,
  apiKey: process.env.PAYOS_API_KEY,
  checksumKey: process.env.PAYOS_CHECKSUM_KEY,
});

export const createPaymentService = async (orderId) => {
  const order = await Order.findById(orderId);
  if (!order) throwError(400, ORDER_MESSAGES.ORDER_NOT_FOUND);
  let paymentOrderCode = order.paymentOrderCode;
  if (!paymentOrderCode) {
    paymentOrderCode = Date.now() % 1000000000;
    order.paymentOrderCode = paymentOrderCode;
    await order.save();
  }
  const payload = {
    orderCode: paymentOrderCode,
    amount: order.totalPrice,
    description: `Thanh toán đơn hàng`,
    returnUrl: "http://localhost:8000/api/payment/webhook",
    cancelUrl: "http://localhost:8000/api/payment/webhook",
  };
  const response = await payos.paymentRequests.create(payload);
  // const response = await payos.payment.createPaymentLink(payload);

  order.paymentCheckoutUrl = response.checkoutUrl;
  order.paymentTransactionId = response.transactionId;
  await order.save();
  return {
    checkoutUrl: response.checkoutUrl,
    orderId: order._id,
    paymentOrderCode,
  };
};

export const handlePayOSWebHookService = async (orderCode, status) => {
  const order = await Order.findOne({ paymentOrderCode: orderCode });
  if (!order) throwError(400, ORDER_MESSAGES.ORDER_NOT_FOUND);
  if (status === "PAID") {
    order.isPaid = true;
    const seatIds = order.seats.map((seat) => seat.seatId);
    const updatedCount = await updateBookedSeats(
      order.userId,
      order.scheduleId,
      seatIds,
    );
    await Schedule.findByIdAndUpdate(order.scheduleId, {
      $inc: { bookedCount: updatedCount.modifiedCount || 0 },
    });
    await order.save();
  }
  if (status === "CANCELLED") {
    await unholdSeatService(order.userId);
    await order.deleteOne();
  }

  return status === "PAID" ? order : null;
};
