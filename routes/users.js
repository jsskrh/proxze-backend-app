const express = require("express");
const router = express.Router();

const Users = require("../controllers/users");

const auth = require("../middleware/index");

router.post("/register", Users.createUser);
router.patch("/register/sub/:token", Users.subProxzeRegistration);
router.get("/verify-email/:token", Users.verifyEmail);
router.post("/resend-token", Users.resendToken);
router.post("/send-token", Users.sendVerificationToken);
router.get("/test-send-token", Users.testRoute);
router.post("/login", Users.loginUser);
router.post("/forgot-password", Users.forgotPassword);
router.patch("/reset-password/:token", Users.resetPassword);
router.put("/location", auth.authToken, Users.updateLocation);
router.get("/profile", auth.authToken, Users.getProfile);
router.get("/dashboard", auth.authToken, Users.getDashboard);
router.patch("/settings/basic-info", auth.authToken, Users.updateBasicInfo);
router.patch("/settings/address", auth.authToken, Users.updateAddress);
router.put("/settings/user-info", auth.authToken, Users.updateUserInfo);
router.put(
  "/settings/payment-info",
  auth.authToken,
  // auth.passwordCheck,
  Users.updatePaymentInfo
);
router.put(
  "/settings/password",
  auth.authToken,
  auth.passwordCheck,
  Users.updatePassword
);
router.put(
  "/settings/deactivate",
  auth.authToken,
  auth.passwordCheck,
  Users.deactivateAccount
);

module.exports = router;
