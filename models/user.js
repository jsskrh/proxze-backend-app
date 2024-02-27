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
    nin: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      validate: {
        validator: function (v) {
          return /^\d{11}$/.test(v);
        },
        message: (props) =>
          `${props.value} is not a valid NIN. It must be an 11-digit number.`,
      },
    },
    password: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
    },
    address: {
      street: {
        type: String,
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
    },
    userType: {
      type: String,
      required: true,
      enum: ["proxze", "principal", "admin", "support", "manager"],
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
    notifications: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Notification" },
    ],
    userBank: {
      type: String,
    },
    accountNumber: {
      type: String,
    },
    paymentInfo: {
      bank: {
        type: String,
      },
      bankCode: {
        type: String,
      },
      accountNumber: {
        type: String,
      },
      accountName: {
        type: String,
      },
    },
    isVerified: {
      type: Boolean,
      default: false,
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
        // default: "Point",
      },
      coordinates: {
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
