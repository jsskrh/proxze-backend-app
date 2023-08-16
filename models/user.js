const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      // required: true,
    },
    state: {
      type: String,
    },
    postalCode: {
      type: String,
    },
    lga: {
      type: String,
    },
    country: {
      type: String,
      default: "Nigeria",
    },
    location: { type: String },
    userType: {
      type: String,
      required: true,
    },
    balance: {
      type: mongoose.Decimal128,
      required: true,
      default: 0.0,
    },
    avatar: {
      type: String,
    },
    bio: {
      type: String,
    },
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],
    notifications: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }],
    userBank: {
      type: String,
    },
    accountNumber: {
      type: String,
    },
    isDisabled: {
      type: Boolean,
      deafult: false,
    },
    isDeactivated: {
      type: Boolean,
      deafult: false,
    },
    token: [{ type: String }],
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coords: {
        type: [Number],
        // default: [0, 0],
      },
    },
  },
  { timestamps: true }
);

userSchema.index({ location: "2dsphere" });
const User = mongoose.model("User", userSchema);
module.exports = User;
