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
      value: {
        type: String,
        required: true,
        trim: true,
        validate: {
          validator: function (v) {
            return /^\d{11}$/.test(v);
          },
          message: (props) =>
            `${props.value} is not a valid NIN. It must be an 11-digit number.`,
        },
      },
      data: { type: mongoose.Schema.Types.ObjectId, ref: "NinData" },
      isVerified: {
        type: Boolean,
        default: false,
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
    oplAddress: {
      label: String,
      placeId: String,
      lga: String,
      state: String,
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
      country: {
        type: String,
        default: "Nigeria",
      },
    },
    resAddress: {
      label: String,
      placeId: String,
      lga: String,
      state: String,
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
      default:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Default_pfp.svg/1200px-Default_pfp.svg.png",
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
    ninVerified: {
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

userSchema.index({
  location: "2dsphere",
  "oplAddress.location": "2dsphere",
  "resAddress.location": "2dsphere",
});
const User = mongoose.model("User", userSchema);
module.exports = User;
