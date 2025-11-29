import { throwError } from "../common/utils/create-response";

let io = null;

export const setIO = (instance) => {
  io = instance;
};

export const getIO = () => {
  if (!io) throwError(500, "Socket chưa được khởi tạo");
  return io;
};
