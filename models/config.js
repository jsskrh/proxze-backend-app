const mongoose = require("mongoose");

const configSchema = new mongoose.Schema(
  {
    _immutable: {
      type: Boolean,
      default: true,
      required: true,
      unique: true,
      immutable: true,
    },

    holdings: {
      total: { type: mongoose.Decimal128, default: 0.0 },
      currentBalance: {
        type: mongoose.Decimal128,
        default: 0.0,
      },
      ledgerBalance: {
        type: mongoose.Decimal128,
        default: 0.0,
      },
    },
  },
  { collection: "config", timestamps: true }
);

const Config = mongoose.model("Config", configSchema);
module.exports = Config;
