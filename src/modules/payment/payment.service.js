import Order from "../order/order.model.js";
import { throwError } from "../../common/utils/create-response.js";
import { ORDER_MESSAGES } from "../order/order.message.js";
import { PayOS } from "@payos/node";
import { unholdSeatService } from "../seat-schedule/seat-schedule.service.js";
import { updateBookedSeats } from "../seat-schedule/seat-schedule.utils.js";
import Schedule from "../schedule/schedule.model.js";
import { sendMail } from "../mail/sendMail.js";
import { MAIL_MESSAGES } from "../mail/mail.messages.js";
import { getDetailOrderTemplateMail } from "../mail/mail.template.js";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import User from "../user/user.model.js";
import QRCode from "qrcode";

dayjs.extend(utc);
dayjs.extend(timezone);

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
    const qrBuffer = await QRCode.toBuffer(order._id.toString(), {
      type: "png",
      width: 250,
    });
    order.qrCode = qrBuffer;
    await order.save();

    const { crew } = await Schedule.findById(order.scheduleId);
    const scheduleCrews = [];
    for (const cr of crew) {
      const { userName, phone } = await User.findById(cr.userId);
      scheduleCrews.push({
        name: userName,
        phone: phone,
        role: cr.role === "driver" ? "Tài xế" : "Phụ xe",
      });
    }
    const { customerInfo, seats, startTime, arrivalTime } = order;
    const { email } = customerInfo;
    const seatLabels = [...seats]
      .sort((a, b) => a.seatOrder - b.seatOrder)
      .map((seat) => seat.seatLabel)
      .join(", ");
    const now = dayjs()
      .tz("Asia/Ho_Chi_Minh")
      .format("YYYY_MM_DDTHH_mm_ss_SSS");
    const startTimeLabel = dayjs(startTime).format(
      "HH [giờ] mm [phút] [ngày] DD [tháng] MM [năm] YYYY",
    );
    const arrivalTimeLabel = dayjs(arrivalTime).format(
      "HH [giờ] mm [phút] [ngày] DD [tháng] MM [năm] YYYY",
    );

    const scheduleInfo = {
      scheduleCrews,
      seatLabels,
      startTimeLabel,
      arrivalTimeLabel,
    };

    await sendMail(
      email,
      MAIL_MESSAGES.CREATEDTICKET_SEND(order._id),
      getDetailOrderTemplateMail({
        email,
        order,
        scheduleInfo,
      }),
      [
        {
          filename: `GOTICKET_${now}`,
          content: qrBuffer,
          cid: "qr_order",
        },
      ],
    );
  }
  if (status === "CANCELLED") {
    await unholdSeatService(order.userId);
    await order.deleteOne();
  }

  return status === "PAID" ? order : null;
};
