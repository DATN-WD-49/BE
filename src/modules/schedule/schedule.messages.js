import dayjs from "dayjs";

export const SCHEDULE_MESSAGES = {
  NOT_FOUND_SCHEDULE: "Không tìm thấy lịch chạy tương ứng!",
  CANCELLED_SCHEDULE: "Lịch chạy này đã bị huỷ không thể chỉnh sửa!",
  // CONFLICT_SCHEDULE: (conflict) => {
  //   return `Có một lịch chạy đang hoạt động bị xung đột thời gian với cái bạn định tạo!
  //   thông tin lịch chạy xung đôt : ${conflict}
  //   `;
  // },
  CONFLICT_SCHEDULE: `Lịch chạy này xung đột với lịch bạn định tạo!`,
  CREATED_SCHEDULE: "Lịch chạy đã được tạo thành công!",
  CREATE_FAILED_SCHEDULE: "Tạo lịch chạy thất bại do trùng thời gian",
  UPDATED_SCHEDULE: "Lịch chạy đã được cập nhật thành công!",
  ACTIVATED: "Lịch chạy này đã hoạt động trở lại!",
  DEACTIVATED: "Lịch chạy này đã bị khóa!",
  CAR_NOT_AVAILABLE: "Chiếc xe phụ trách lịch chạy này đang không hoạt động!",
  CAR_CONFLICT: (conflictCar) => {
    return `Xe ${conflictCar.carId.licensePlate} đã có lịch vào lúc ${dayjs(conflictCar.startTime).format("HH:mm[,] dddd [Ngày] DD [Tháng] MM [Năm] YYYY")}.`;
  },
  CREW_CONFLICT: (conflict, conflictCrews) => {
    return `Nhân sự ${conflictCrews.map((crew) => crew.userName).join(", ")} đã có lịch vào lúc ${dayjs(conflict.startTime).format("HH:mm[,] dddd [Ngày] DD [Tháng] MM [Năm] YYYY")}.`;
  },
  ROUTE_NOT_AVAILABLE:
    "tuyến đường tương ứng với lịch chạy này đang không khả dụng!",
  DISABLE_BY_HANDLE: "Lịch chạy này đã bị khóa trước đó",
  CREATE_MANY_SCHEDULE: (successLength) => {
    return `Đã tạo thành công : ${successLength} lịch chạy `;
  },
  CREATE_MANY_ERROR_SCHEDULE: (totalLength, failedLength) => {
    return `Tạo lịch chạy thất bại do có ${failedLength} lịch chạy tạo thất bại trong ${totalLength} lịch chạy`;
  },
};
