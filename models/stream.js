const mongoose = require("mongoose");

const streamSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    url: { type: String, trim: true },
    location: { type: String, required: true, trim: true },
    size: { type: Number, trim: true },
    live: { type: Boolean, required: true, trim: true },
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },
  },
  { timestamps: true }
);

const Stream = mongoose.model("Stream", streamSchema);
module.exports = Stream;
