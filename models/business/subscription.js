const mongoose = require("mongoose");

const SubscriptionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["Basic", "Plus", "Standard", "Premium"],
      required: true,
    },
    principalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    duration: { type: String, enum: ["monthly", "annually"], required: true },
    expireAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

SubscriptionSchema.pre("save", function (next) {
  if (!this.expireAt) {
    const now = new Date();
    if (this.duration === "monthly") {
      this.expireAt = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        now.getDate()
      );
    } else if (this.duration === "annually") {
      this.expireAt = new Date(
        now.getFullYear() + 1,
        now.getMonth(),
        now.getDate()
      );
    }
  }
  next();
});

module.exports = mongoose.model("Subscription", SubscriptionSchema);
