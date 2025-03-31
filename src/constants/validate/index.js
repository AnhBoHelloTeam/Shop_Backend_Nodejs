export const VALIDATE = {
  MINIMUM_NAME_LENGTH: 3,
  MINIMUM_ADDRESS_LENGTH: 5,
  MINIMUM_PASSWORD_LENGTH: 8,
  EMAIL_VALIDATION_REGEX: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
  PHONE_VALIDATION_REGEX: /\(?([0-9]{3})\)?([ .-]?)([0-9]{3})\2([0-9]{4})/,
};

export const MESSAGES = {
  FIELD_REQUIRED: 'Trường bạn nhập không được để trống',
  EMAIL_REQUIRED: 'Email không được để trống',
  PRODUCT_NAME_REQUIRED: 'Tên sản phẩm không được để trống',
  PRODUCT_CATEGORY_REQUIRED: 'Danh mục không được để trống',
  INVALID_PRICE_PRODUCT: 'Giá không hợp lệ',
  INVALID_EMAIL: 'Email không hợp lệ',
  INVALID_PHONE: 'Số điện thoại không hợp lệ',
  INVALID_FULL_NAME: 'Họ và tên phải có ít nhất 3 ký tự',
  INVALID_PASSWORD: 'Password phải có 8 ký tự',
  INVALID_ADDRESS: 'Địa chỉ phải có ít nhất 5 ký tự',
  INCORRECT_PASSWORD: 'Password không chính xác',
  PASSWORD_REQUIRED: 'Password không được để trống',
  ACCOUNT_ALREADY_EXISTS: 'Tài khoản đã tồn tại',
  ACCOUNT_DOES_NOT_EXIST: 'Tài khoản không tồn tại',
  IMAGE_UPDATE_SUCCESS: 'Cập nhật ảnh thành công',
  IMAGE_UPDATE_FAILURE: 'Cập nhật ảnh không thành công',
};
