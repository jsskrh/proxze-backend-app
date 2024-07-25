const express = require("express");
const router = express.Router();
const Subscription = require("../../controllers/business/subscription");

router.post("/", Subscription.createSubscription);
router.patch("/:id", Subscription.updateSubscription);
router.delete("/:id", Subscription.deleteSubscription);
router.get("/:id", Subscription.getSubscriptionById);
router.get("/", Subscription.getAllSubscriptions);

module.exports = router;
