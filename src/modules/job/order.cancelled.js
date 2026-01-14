import dayjs from "dayjs";
import { getIO } from "../../socket/socket.instance.js";
import cron from "node-cron";
import Order from "../order/order.model.js";

export const cleanCancelledOrders = async () => {
  try {
    const now = dayjs().toDate();
    const cancelledOrders = await Order.find({
      isPaid: true,
      startTime: { $lte: now },
      status: "BUYED",
    });
    if (cancelledOrders.length > 0) {
      const OrderIds = cancelledOrders.map((order) => order._id);
      const ressult = await Order.updateMany(
        {
          _id: { $in: OrderIds },
        },
        [
          {
            $set: {
              status: "CANCELLED",
              cancelDescription: "Chủ vé không tới điểm đón",
            },
          },
        ],
      );
      console.log(
        `[${dayjs().format("YYYY-MM-DD HH:mm:ss")}] Updated ${ressult.modifiedCount} cancelled Orders.`,
      );
      const io = getIO();
      OrderIds.forEach((OrderId) => {
        io.to(OrderId).emit("OrderUpdated", {
          message: "Some Orders have cancelled",
          modifiedCount: ressult.modifiedCount,
          timestamp: dayjs().toISOString(),
        });
      });
    }
  } catch (err) {
    console.error(err);
  }
};

export const startOrdersCancelledJob = () => {
  console.log("✓ Orders clean job started.");
  const task = cron.schedule("* * * * *", async () => {
    console.log("✓ Orders clean runtime");
    await cleanCancelledOrders();
  });
  return task;
};
