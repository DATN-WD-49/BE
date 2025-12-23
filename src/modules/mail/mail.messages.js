export const MAIL_MESSAGES = {
  VERIFY_SEND: "[GO TICKET] - Xác thực Tài Khoản",
  RESETPASSWORD_SEND: "[GO TICKET] - Mật khẩu mới của bạn",
  CREATEDTICKET_SEND: function (orderId) {
    return `[GO TICKET] - Thông tin đơn hàng ${orderId}`;
  },
};
