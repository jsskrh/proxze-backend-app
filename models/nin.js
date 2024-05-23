const mongoose = require("mongoose");

const ninSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    middleName: {
      type: String,
      trim: true,
    },
    otherName: {
      type: String,
      trim: true,
    },
    maidenName: {
      type: String,
      trim: true,
    },
    photo: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
    },
    gender: {
      type: String,
      trim: true,
    },
    trackingId: {
      type: String,
      trim: true,
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    maritalStatus: {
      type: String,
      trim: true,
    },
    dateOfBirth: {
      type: String,
      trim: true,
    },
    address: {
      street1: {
        type: String,
        trim: true,
      },
      street2: {
        type: String,
        trim: true,
      },
      town: {
        type: String,
        trim: true,
      },
      lga: {
        type: String,
        trim: true,
      },
      postalcode: {
        type: String,
        trim: true,
      },
      state: {
        type: String,
        trim: true,
      },
    },
    nin: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

const Nin = mongoose.model("Nin", ninSchema);
module.exports = Nin;
