const mongoose = require("mongoose");

const ninDataSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      trim: true,
    },
    surname: {
      type: String,
      trim: true,
    },
    middleName: {
      type: String,
      trim: true,
    },
    userid: {
      type: String,
      trim: true,
    },
    gender: {
      type: String,
      trim: true,
    },
    trustedNumber: {
      type: String,
      trim: true,
    },
    txid: {
      type: String,
      trim: true,
    },
    ts: {
      type: String,
      trim: true,
    },
    agentID: {
      type: String,
      trim: true,
    },
    photo: {
      type: String,
      trim: true,
    },
    nin: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

const NinData = mongoose.model("NinData", ninDataSchema);
module.exports = NinData;
