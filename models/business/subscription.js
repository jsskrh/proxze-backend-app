const mongoose = require("mongoose");

const SubscriptionSchema = new mongoose.Schema({
  type: { type: String, enum: ["Regular", "Premium"], required: true },
});

module.exports = mongoose.model("Subscription", SubscriptionSchema);
