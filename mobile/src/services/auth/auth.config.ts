const AUTH_ROOT = "/customer/auth";

const AUTH_ENDPOINTS = {
  SEND_OTP: `${AUTH_ROOT}/send-otp`,
  VERIFY_OTP: `${AUTH_ROOT}/verify-otp`,
  RESEND_OTP: `${AUTH_ROOT}/resend-otp`,
  REFRESH: `${AUTH_ROOT}/refresh`,
  LOGOUT: `${AUTH_ROOT}/logout`,
  SOCIAL_LOGIN: `${AUTH_ROOT}/social-login`,
};

export default AUTH_ENDPOINTS;
