const mongoose = require("mongoose");

const bulkTaskSchema = new mongoose.Schema(
  {
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    bill: {
      rate: { type: Number, trim: true },
      subtotal: { type: Number, trim: true },
      serviceFee: { type: Number, trim: true },
      total: { type: Number, trim: true },
    },
    status: {
      type: String,
      default: "pending",
      enum: ["pending", "approved", "rejected", "active", "completed"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    data: [
      {
        name: { type: String, required: true },
        address: { type: String, required: true },
        gender: { type: String, required: true },
        location: {
          label: { type: String, required: true, trim: true },
          coords: {
            lat: { type: Number, required: true, trim: true },
            lng: { type: Number, required: true, trim: true },
          },
        },
        status: {
          type: String,
          default: "pending",
          enum: ["pending", "approved", "rejected"],
        },
      },
    ],
    tasks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task",
      },
    ],
    principalPayment: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Transaction",
      },
    ],
    proxzePayment: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Transaction",
      },
    ],
  },
  { timestamps: true }
);

const BulkTask = mongoose.model("BulkTask", bulkTaskSchema);
module.exports = BulkTask;
