const mongoose = require("mongoose");

const systemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      default: "My Proxzi",
      trim: true,
      unique: true,
    },
    balance: {
      type: mongoose.Decimal128,
      required: true,
      default: 0.0,
    },
    email: {
      type: String,
      required: true,
      default: "kasieakorah@gmail.com",
      trim: true,
      unique: true,
    },
  },
  { timestamps: true }
);

const System = mongoose.model("System", systemSchema);
module.exports = System;
