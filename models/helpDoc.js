const mongoose = require("mongoose");

const helpDocSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    topic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HelpTopic",
    },
    viewers: {
      type: String,
      default: "all",
      enum: ["staff", "principal", "proxze", "all"],
    },
    content: { type: String, required: true },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    views: { type: Number, default: 0 },
  },

  { timestamps: true }
);

const HelpDoc = mongoose.model("HelpDoc", helpDocSchema);
module.exports = HelpDoc;
