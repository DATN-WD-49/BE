import dayjs from "dayjs";

export const ORDER_MESSAGES = {
  ORDER_NOT_FOUND: "Không tìm thấy thông tin đơn hàng được yêu cầu",
  ORDER_CREATED: "Đơn hàng đã được tạo thành công",
  ORDER_UPDATED: "Đơn hàng đã được cập nhật",
  CAR_NOT_FOUND: "Xe bạn đặt không tồn tại trong hệ thống!",
  CAR_NOT_AVALIABLE: (licensePlate) => {
    `Xe ${licensePlate} hiện không khả dụng vui lòng thử lại`;
  },
  ROUTE_NOT_FOUND: "Tuyến đường bạn đặt không tồn tại trong hệ thống!",
  ROUTE_NOT_AVALIABLE: (route) => {
    `Tuyến đường ${route.pickupPoint.label} - ${route.dropPoint.label} hiện không khả dụng`;
  },
  SCHEDULE_NOT_FOUND: "Lịch chạy bạn đặt không tồn tại trong hệ thống",
  SCHEDULE_NOT_AVALIABLE: (schedule) => {
    `Lịch chạy từ ${schedule.pickupPoint} đến ${schedule.dropPoint} vào lúc ${dayjs(schedule.startTime).format("HH:mm - DD/MM/YYYY")} đã không còn khả dụng`;
  },
  NOT_VALID_SEATS: "Danh sách ghế không hợp lệ",
  SEAT_NOT_FOUND: "Một hoặc nhiều ghế không tồn tại trong hệ thống",
  SEAT_NOT_AVALIABLE: (seatLabels) => {
    `Ghế ${seatLabels} đã được đặt hoặc không còn khả dụng`;
  },
  CONFLICT_ORDER: "Đã có một vé xe khác với thông tin tương tự",
  ORDER_NOT_AVALIABLE: "Vé xe đã không còn khả dụng",
  ORDER_NOT_PAID: "Vé xe này chưa được thanh toán",
  ORDER_NOT_USED: "Vé xe này chưa được sử dụng",
};
