import dayjs from "dayjs";
import { getIO } from "../../socket/socket.instance.js";
import cron from "node-cron";
import Order from "../order/order.model.js";

export const cleanExpiredOrders = async () => {
  try {
    const now = dayjs().toDate();
    const expiredOrders = await Order.find({
      isPaid: false,
      expiredDate: { $lt: now },
    });
    if (expiredOrders.length > 0) {
      const OrderIds = expiredOrders.map((order) => order._id.toString());
      const ressult = await Order.deleteMany({
        _id: { $in: expiredOrders.map((seat) => seat._id) },
      });
      console.log(
        `[${dayjs().format("YYYY-MM-DD HH:mm:ss")}] Deleted ${ressult.deletedCount} expired Orders.`,
      );
      const io = getIO();
      OrderIds.forEach((OrderId) => {
        io.to(OrderId).emit("OrderUpdated", {
          message: "Some Orders have expired",
          deletedCount: ressult.deletedCount,
          timestamp: dayjs().toISOString(),
        });
      });
    }
  } catch (err) {
    console.error(err);
  }
};

export const startOrdersExpiredJob = () => {
  console.log("✓ Orders clean job started.");
  const task = cron.schedule("* * * * *", async () => {
    console.log("✓ Orders clean runtime");
    await cleanExpiredOrders();
  });
  return task;
};
