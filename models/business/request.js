const mongoose = require("mongoose");

const RequestSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["oneToMany", "manyToOne", "manyToMany"],
    required: true,
  },
  network: {
    type: String,
    enum: ["internal", "external", "both"],
    required: true,
  },
  payment: {
    type: String,
    enum: ["noPayment", "compensation", "discount"],
    required: true,
  },
  image: { type: String },
  doc: { type: String },
  tag: { type: String },
  description: { type: String, required: true },
  principalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Group" },
});

module.exports = mongoose.model("Request", RequestSchema);
