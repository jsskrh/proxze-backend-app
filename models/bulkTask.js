const mongoose = require("mongoose");

const bulkTaskSchema = new mongoose.Schema(
  {
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    bill: { type: Number, required: true, trim: true },
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
    data: [],
    // data: {
    //   type: String,
    //   required: true,
    // },
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
