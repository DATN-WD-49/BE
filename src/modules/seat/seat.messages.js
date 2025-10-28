export const SEAT_MESSAGES = {
  CREATED: "Tạo ghế thành công!",
  NOT_FOUND: "Không tìm thấy ghế hiện tại!",
  ACTIVATED: "Ghế đã được mở lại và đã sẵn sàng hoạt động!",
  DEACTIVATED: "Ghế đã bị vô hiệu hoá, hiện không thể hoạt động!",
  QUANTITY_INVALID: "Số lượng ghế không hợp lệ!",
  COLUMNS_INVALID: "Sô lượng cột không hợp lệ!",
  ID_REQUIRED: "Cần có Id của xe để tạo ghế!",
  SEATLABEL_EXIST: "Tên ghế này đã tồn tại trên xe này!",
  SEATORDER_EXIST: "Đã có ghế nằm ở trên vị trí này!",
  NOTFOUND_DELETE: "Ghế đã bị xóa hoặc không tồn tại!",
  DELETED_SEAT: "Xóa ghế thành công!",
  DELETED_FLOOR: (count) => {
    return `Xóa thành công ${count} ghế!`;
  },
  DELETED_FAIL_FLOOR: "Xóa tầng thất bại!",
  DEACTIVE_FLOOR: "Khóa toàn bộ ghế ở tầng thành công!",
  ACTIVE_FLOOR: "Mở khóa toàn bộ ghế ở tầng thành công!",
  OUTMAXQUANTITY_SEAT: "Số lượng ghế không được vượt quá 30 ghế 1 tầng",
};
