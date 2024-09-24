const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      // required: true,
      trim: true,
    },
    lastName: {
      type: String,
      // required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    ninData: {
      nin: {
        type: String,
        // required: true,
        trim: true,
        validate: {
          validator: function (v) {
            return /^\d{11}$/.test(v);
          },
          message: (props) =>
            `${props.value} is not a valid NIN. It must be an 11-digit number.`,
        },
      },
      data: { type: mongoose.Schema.Types.ObjectId, ref: "Nin" },
      isVerified: {
        type: Boolean,
        default: false,
      },
    },
    password: {
      type: String,
      // required: true,
    },
    phoneNumber: {
      type: String,
      // required: true,
      // unique: true,
    },
    phoneToken: {
      type: String,
      // required: true,
    },
    phoneVerified: {
      type: Boolean,
      default: false,
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
      enum: [
        "proxze",
        "principal",
        "admin",
        "support",
        "manager",
        "super-proxze",
        "sub-principal",
      ],
    },
    referralToken: {
      type: String,
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
    isDisabled: {
      type: Boolean,
      deafult: false,
    },
    isDeactivated: {
      type: Boolean,
      deafult: false,
    },
    token: [{ type: String }],
    superProxze: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    group: { type: mongoose.Schema.Types.ObjectId, ref: "Group" },
    subProxzes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    superApproved: { type: Boolean },
    superRejected: { type: Boolean },
    superPerc: {
      type: Number,
      min: 0,
      max: 100,
      validate: {
        validator: function (v) {
          return v >= 0 && v <= 100;
        },
        message: (props) =>
          `${props.value} is not a valid percentage. It must be between 0 and 100.`,
      },
    },
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
   
    noOfProxzes: { type: Number },

    // ----- PROXZE BUSINESS -----
    agency: { type: String },
    serviceOffered: { type: String },
    intendedProxy: { type: String },
    areaOfOperation: { type: String },
    subscription: { type: mongoose.Schema.Types.ObjectId, ref: "Subscription" },
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
// moxnYh-qiwta9-funfyd
// bartef-dafxy0-tinNep
