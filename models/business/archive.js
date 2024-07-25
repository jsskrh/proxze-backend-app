const mongoose = require("mongoose");

const ArchiveSchema = new mongoose.Schema({
  type: { type: String, enum: ["video", "image"], required: true },
  proxyId: { type: String, required: true },
  principalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  url: { type: String, required: true },
});

module.exports = mongoose.model("Archive", ArchiveSchema);
