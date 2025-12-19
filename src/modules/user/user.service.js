import dayjs from "dayjs";
import { throwError } from "../../common/utils/create-response.js";
import { queryBuilder } from "../../common/utils/query-builder.js";
import { AUTH_MESSAGES } from "../auth/auth.messages.js";
import { generateToken, hashPassword } from "../auth/auth.utils.js";
import User from "./user.model.js";
import {
  API_URL,
  JWT_VERIFY_EXPIRED,
  JWT_VERIFY_SECRET,
} from "../../common/configs/environment.js";
import { sendMail } from "../mail/sendMail.js";
import { getVerifyTemplateMail } from "../mail/mail.template.js";
import { MAIL_MESSAGES } from "../mail/mail.messages.js";

export const getProfileService = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throwError(401, AUTH_MESSAGES.NOTFOUND_USER);
  }
  return user;
};

export const updateUserProfileService = async (userId, payload) => {
  const userUpdating = await User.findById(userId);
  if (!userUpdating) {
    throwError(401, AUTH_MESSAGES.NOTFOUND_USER);
  }
  //Có nên tách đổi mật khẩu sang nhánh riêng không?
  const { userName, phone, password, repassword, avatar } = payload;
  if (userName) {
    const userNameConflict = await User.find({ userName: userName });
    if (userNameConflict) {
      throwError(400, AUTH_MESSAGES.CONFLICT_NAME);
    }
    userUpdating.userName = userName;
  }
  if (phone) {
    const phoneConflict = await User.find({ phone: phone });
    if (phoneConflict) {
      throwError(400, AUTH_MESSAGES.CONFLICT_PHONE);
    }
    userUpdating.phone = phone;
  }
  if (password) {
    if (!repassword || password !== repassword) {
      throwError(400, AUTH_MESSAGES.CONFLICT_PASSWORD);
    }
    userUpdating.password = await hashPassword(password);
  }
  //một hàn để cập nhật avatar
  //
  await userUpdating.save();
  return userUpdating;
};

//chức năng cho admin

export const getAllUserService = async (query) => {
  const users = await queryBuilder(User, query);
  return users;
};

export const getDetailUserService = async (id) => {
  const user = await User.findById(id).lean();
  if (!user) {
    throwError(401, AUTH_MESSAGES.NOTFOUND_USER);
  }
  return user;
};

export const createUserService = async (payload) => {
  const { userName, email, phone, password, role = "staff" } = payload;
  const userNameConflict = await User.findOne({
    userName: userName,
  });
  if (userNameConflict) {
    throwError(400, AUTH_MESSAGES.CONFLICT_NAME);
  }
  const conflictUsers = await User.find({
    $or: [{ email }, { phone }],
  });
  if (conflictUsers) {
    const conflictUsers = [];
    conflictUsers.forEach((user) => {
      if (user.email === email) {
        conflictUsers.push({ emailConflictUser: user });
      }
      if (user.phone === phone) {
        conflictUsers.push({ phoneConflictUser: user });
      }
    });
    return {
      user: conflictUsers,
      conflictAmount: conflictUsers.length,
    };
  }
  if (role === "admin") {
    throwError(400, "Admin này hiện tại phải là admin duy nhất");
  }
  const hashedPassword = await hashPassword(password);
  const user = await User.create({
    ...payload,
    password: hashedPassword,
  });
  const payloadJwt = {
    _id: user._id,
    role: user.role,
  };
  const verifyToken = generateToken(
    payloadJwt,
    JWT_VERIFY_SECRET,
    JWT_VERIFY_EXPIRED,
  );
  user.verifyToken = verifyToken;
  await user.save();
  await sendMail(
    email,
    MAIL_MESSAGES.VERIFY_SEND,
    getVerifyTemplateMail({
      email,
      link: `${API_URL}/auth/verify/${verifyToken}`,
    }),
  );
  return user;
};

export const updateUserService = async (userId, payload) => {
  const userUpdating = await User.findById(userId);
  if (!userUpdating) {
    throwError(401, AUTH_MESSAGES.NOTFOUND_USER);
  }
  const { userName, phone, role } = payload;
  if (userName) {
    const userNameConflict = await User.find({
      userName: userName,
      _id: { $ne: userId },
    });
    if (userNameConflict) {
      throwError(400, AUTH_MESSAGES.CONFLICT_NAME);
    }
    userUpdating.userName = userName;
  }
  if (phone) {
    const phoneConflict = await User.find({
      phone: phone,
      _id: { $ne: userId },
    });
    if (phoneConflict) {
      throwError(400, AUTH_MESSAGES.CONFLICT_PHONE);
    }
    userUpdating.phone = phone;
  }
  if (role === "admin")
    throwError(400, "Admin này hiện tại phải là admin duy nhất");
  userUpdating.role = role;
  await userUpdating.save();
  return userUpdating;
};

export const changeLockUserService = async (userId, expiredLock) => {
  const user = await User.findById(userId);
  if (!user) {
    throwError(401, AUTH_MESSAGES.NOTFOUND_USER);
  }
  if (user.isLocked) {
    user.isLocked = false;
    user.expiredBanned = null;
  } else {
    user.isLocked = true;
    if (expiredLock) {
      const expireB = expiredLock.toDate();
      user.expiredBanned = expireB;
    } else {
      user.expiredBanned = dayjs().add(30, "year").toDate();
    }
  }
  user.save();
  return user;
};
