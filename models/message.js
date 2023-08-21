const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },
    seen: { type: Boolean, default: false, trim: true },
    read: { type: Boolean, default: false, trim: true },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    content: { type: String },
  },

  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);
module.exports = Message;
