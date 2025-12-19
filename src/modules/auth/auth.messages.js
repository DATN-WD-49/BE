export const AUTH_MESSAGES = {
  CONFLICT_EMAIL: "Địa chỉ email này đã tồn tại!",
  CONFLICT_NAME: "Tên người dùng này đã tồn tại!",
  CONFLICT_PHONE: "Số điện thoại này đã tồn tại!",
  REGISTER_SUCCESS:
    "Đăng ký thành công vui lòng kiểm tra email để xác thực tài khoản!",
  NOTFOUND_EMAIL: "Địa chỉ email này chưa được đăng ký!",
  WRONG_PASSWORD: "Thông tin đăng nhập không chính xác!",
  NOT_VERIFIED: "Tài khoản của bạn chưa được xác thực!",
  LOGIN_SUCCESS: "Đăng nhập thành công!",
  SEND_VERIFY_SUCCESS:
    "Vui lòng kiểm tra email chúng tôi đã gửi mã xác thực tới tài khoản của bạn",
  VERIFIED_SUCCESS: "Xác thực tài khoản thành công!",
  NOTFOUND_USER: "Không tìm thấy tài khoản của bạn!",
  RESETPASS_SUCCESS:
    "Vui lòng kiểm tra email chúng tôi đã gửi mật khẩu mới tới email của bạn",
  VALIDATE_ERROR: "ERROR_VALIDATE",
  CONFLICT_PASSWORD: "Hai trường nhập mật khẩu phải trùng nhau!",
  UPDATED_USER: "Cập nhật thông tin người dùng thành công",
  CREATED_STAFF: "Thêm nhân viên mới thành công",
  CONFLICT_CREATESTAFF: (amount) => {
    return `Có ${amount} người dùng bị trùng thông tin với thông tin bạn nhập`;
  },
};
