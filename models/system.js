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
    ledgerBalance: {
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
    paymentPercentage: {
      default: 85,
      type: Number,
      required: true,
      trim: true,
      min: 0,
      max: 100,
    },
  },
  { timestamps: true }
);

const System = mongoose.model("System", systemSchema);
module.exports = System;
