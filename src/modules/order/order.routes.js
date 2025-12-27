import { Router } from "express";
import {
  comfirmStatusOrder,
  createOrder,
  getAllOrder,
  getAllOrderByUser,
  getDetailOrder,
  updateOrder,
} from "./order.controller.js";
import { authenticate } from "../../common/middlewares/auth.middleware.js";
import { JWT_ACCESS_SECRET } from "../../common/configs/environment.js";

const orderRouter = Router();

orderRouter.get("/", getAllOrder);
orderRouter.get(
  "/my-order",
  authenticate(JWT_ACCESS_SECRET),
  getAllOrderByUser,
);
orderRouter.get("/detail/:id", getDetailOrder);
orderRouter.post("/create-payos", createOrder);
orderRouter.patch("/update/:id", updateOrder);
orderRouter.patch("/confirm/:id", comfirmStatusOrder);
export default orderRouter;
