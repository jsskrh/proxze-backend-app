const express = require("express");
const router = express.Router();

const Users = require("../controllers/users");

const auth = require("../middleware/index");

router.post("/register", Users.createUser);
router.post("/login", Users.loginUser);
router.put("/location", auth.authToken, Users.updateLocation);
router.get("/profile", auth.authToken, Users.getUser);
router.get("/dashboard", auth.authToken, Users.getDashboard);
router.put("/settings/user-info", auth.authToken, Users.updateUserInfo);
router.put(
  "/settings/payment-info",
  auth.authToken,
  auth.passwordCheck,
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
