import { throwError } from "../../common/utils/create-response";

export default async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(throwError(401, "Unauthorized"));
    next();
  } catch (err) {
    next(throwError(500, "Socket không hợp lệ"));
  }
};
