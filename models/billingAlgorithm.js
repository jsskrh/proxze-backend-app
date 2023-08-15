const mongoose = require("mongoose");

const billingAlgorithmSchema = new mongoose.Schema(
  {
    baseRate: { type: Number, required: true, trim: true, min: 1 },
    certification: [
      {
        type: { type: String, required: true, trim: true },
        value: { type: Number, required: true, trim: true, min: 1 },
      },
    ],
    educationLevel: [
      {
        level: { type: String, required: true, trim: true },
        value: { type: Number, required: true, trim: true, min: 1 },
      },
    ],
    skillLevel: [
      {
        level: { type: String, required: true, trim: true },
        value: { type: Number, required: true, trim: true, min: 1 },
      },
    ],
    yearsOfExperience: [
      {
        range: { type: String, required: true, trim: true },
        value: { type: Number, required: true, trim: true, min: 1 },
      },
    ],
    timeBlock: {
      periods: [
        {
          period: { type: String, required: true, trim: true },
          value: { type: Number, required: true, trim: true, min: 1 },
        },
      ],
      hoursPerPeriod: {
        type: Number,
        required: true,
        trim: true,
        max: 24,
        min: 1,
      },
      dayStartTime: { type: String, required: true, trim: true },
      nightStartTime: { type: String, required: true, trim: true },
    },
    searchRange: [
      {
        range: { type: String, required: true, trim: true },
        value: { type: Number, required: true, trim: true, min: 1 },
      },
    ],
    locationClass: [
      {
        level: { type: String, required: true, trim: true },
        value: { type: Number, required: true, trim: true, min: 1 },
      },
    ],
    paymentPercentage: {
      type: Number,
      required: true,
      trim: true,
      min: 0,
      max: 100,
    },
  },
  { timestamps: true }
);

const BillingAlgorithm = mongoose.model(
  "BillingAlgorithm",
  billingAlgorithmSchema
);
module.exports = BillingAlgorithm;
