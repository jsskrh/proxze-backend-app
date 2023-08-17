const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    transactionType: {
      type: String,
      required: true,
      enum: ["CR", "DR"],
    },
    purpose: {
      type: String,
      enum: ["deposit", "transfer", "reversal", "withdrawal"],
      required: true,
    },
    amount: {
      type: mongoose.Decimal128,
      required: true,
      default: 0.0,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    system: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "System",
    },
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
    },
    reference: { type: String, required: true },
    balanceBefore: {
      type: mongoose.Decimal128,
      required: true,
    },
    balanceAfter: {
      type: mongoose.Decimal128,
      required: true,
    },
    summary: { type: String, required: true },
    transactionSummary: { type: String, required: true },
  },
  { timestamps: true }
);

const Transaction = mongoose.model("Transaction", transactionSchema);
module.exports = Transaction;
