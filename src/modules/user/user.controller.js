import { response } from "express";
import handleAsync from "../../common/utils/async-handler.js";
import createResponse from "../../common/utils/create-response.js";
import { AUTH_MESSAGES } from "../auth/auth.messages.js";
import {
  changeLockUserService,
  createUserService,
  getAllUserService,
  getDetailUserService,
  getProfileService,
  updateUserProfileService,
  updateUserService,
} from "./user.service.js";

export const getProfile = handleAsync(async (req, res) => {
  const { _id } = req.user;
  const response = await getProfileService(_id);
  return createResponse(res, 200, "OK", response);
});

export const updateUserProfile = handleAsync(async (req, res) => {
  const { _id } = req.user;
  const { payload } = req.body;
  const response = await updateUserProfileService(_id, payload);
  return createResponse(res, 200, AUTH_MESSAGES.UPDATED_USER, response);
});
//tạm thời sẽ không thêm delete
//

//chức năng cho admin
//
export const getAllUser = handleAsync(async (req, res) => {
  const { query } = req;
  const { data, meta } = await getAllUserService(query);
  return createResponse(res, 200, "OK", data, meta);
});

export const getDetailUser = handleAsync(async (req, res) => {
  const { id } = req.params;
  const response = await getDetailUserService(id);
  return createResponse(res, 200, "OK", response);
});

export const createUser = handleAsync(async (req, res) => {
  const { payload } = req.body;
  const { users, conflictAmount } = await createUserService(payload);
  if (!conflictAmount)
    return createResponse(res, 201, AUTH_MESSAGES.CREATED_STAFF, users);
  return createResponse(
    res,
    200,
    AUTH_MESSAGES.CONFLICT_CREATESTAFF(conflictAmount),
    users,
  );
});

export const updateUser = handleAsync(async (req, res) => {
  const { id } = req.params;
  const { payload } = req.body;
  const response = await updateUserService(id, payload);
  return createResponse(res, 200, AUTH_MESSAGES.UPDATED_USER, response);
});

export const changeLockUser = handleAsync(async (req, res) => {
  const { id } = req.params;
  const { expiredBanned } = req.body;
  const changedLockUser = changeLockUserService(id, expiredBanned);
  const status = changeLockUser.isLocked;
  return createResponse(
    res,
    200,
    status ? "người dùng đã bị khóa" : "người dùng đã được mở khóa",
    changedLockUser,
  );
});
