import { ROOT_MESSAGES } from "../../common/constants/messages.js";
import handleAsync from "../../common/utils/async-handler.js";
import createResponse from "../../common/utils/create-response.js";
import { ORDER_MESSAGES } from "./order.message.js";
import {
  comfirmOrderService,
  createOrderService,
  getAllOrderByUserService,
  getAllOrderService,
  getDetailOrderService,
  updateOrderService,
  verifyOrderService,
} from "./order.service.js";

export const getAllOrder = handleAsync(async (req, res) => {
  const query = req.query;
  const { data, meta } = await getAllOrderService(query);
  return createResponse(res, 200, ROOT_MESSAGES.OK, data, meta);
});

export const getAllOrderByUser = handleAsync(async (req, res) => {
  const { _id } = req.user;
  const { data, meta } = await getAllOrderByUserService(_id, req.query);
  return createResponse(res, 200, ROOT_MESSAGES.OK, data, meta);
});

export const getDetailOrder = handleAsync(async (req, res) => {
  const { id } = req.params;
  const response = await getDetailOrderService(id);
  return createResponse(res, 200, ROOT_MESSAGES.OK, response);
});

export const createOrder = handleAsync(async (req, res) => {
  const payload = req.body;
  const response = await createOrderService(payload);
  return createResponse(res, 201, ORDER_MESSAGES.ORDER_CREATED, response);
});

export const updateOrder = handleAsync(async (req, res) => {
  const { id } = req.params;
  const payload = req.body;
  const response = await updateOrderService(id, payload);
  return createResponse(res, 200, ORDER_MESSAGES.ORDER_UPDATED, response);
});

export const comfirmStatusOrder = handleAsync(async (req, res) => {
  const { id } = req.params;
  const { newStatus } = req.body;
  const response = await comfirmOrderService(id, newStatus);
  return createResponse(res, 200, ORDER_MESSAGES.ORDER_UPDATED, response);
});

export const verifyOrder = handleAsync(async (req, res) => {
  const { id } = req.params;
  const { response, message } = await verifyOrderService(id);
  return createResponse(
    res,
    message ? 400 : 200,
    message ? message : ORDER_MESSAGES.ORDER_NOT_USED,
    response,
  );
});
