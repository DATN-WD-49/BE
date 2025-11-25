export const CAR_MESSAGES = {
  EXISTING_CAR_NAME: "Tên xe này đã tồn tại trong hệ thống!",
  EXISTING_CAR_LICENSE: "Biển số xe này đã tồn tại trong hệ thống!",
  CREATE_SUCCESS: "Thêm mới xe thành công!",
  UPDATE_SUCCESS: "Cập nhật lại xe thành công!",
  NOT_FOUND: "Không tìm thấy xe hiện tại!",
  ACTIVATED: (unlockScheduleSuccess, unlockScheduleFailed) =>
    `Xe đã được kích hoạt và sẵn sàng hoạt động!, có 
    ${unlockScheduleSuccess} lịch chạy đã được mở khóa lại và 
    ${unlockScheduleFailed} lịch chạy mở khóa thất bại`,
  DEACTIVATED:
    "Xe đã bị vô hiệu hóa, các lịch chạy chưa bị khóa hiện không thể hoạt động!",
};
