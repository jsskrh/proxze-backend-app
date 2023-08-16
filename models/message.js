const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    type: { type: String, required: true, trim: true },
    seen: { type: Boolean, default: false, trim: true },
    read: { type: Boolean, default: false, trim: true },
    content: { type: String },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
    },
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ticket",
    },
    amount: { type: Number, trim: true },
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);
module.exports = Message;
