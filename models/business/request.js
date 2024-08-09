const mongoose = require("mongoose");

const RequestSchema = new mongoose.Schema(
  {
    title: { type: String },
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
    schedule: {
      type: String,
      enum: ["daily","weekly", "monthly"],
      required: true,
    },
    image: { type: String },
    doc: { type: String },
    tag: { type: String },
    class: {
      type: [String],
      enum: ["class1", "class2", "class3", "class4", "class5"],
    },
    description: { type: String, required: true },
    principalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Group" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Request", RequestSchema);
