const express = require("express");
const router = express.Router();

const Notifications = require("../controllers/notifications");

const auth = require("../middleware/index");

router.get("/", auth.authToken, Notifications.getAllNotifications);
router.get("/unseen", auth.authToken, Notifications.getUnseenNotifications);
router.put("/update/seen", auth.authToken, Notifications.setToSeen);
router.put(
  "/update/read/:notificationId",
  auth.authToken,
  Notifications.setToRead
);

module.exports = router;
