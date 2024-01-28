const mongoose = require("mongoose");

const helpOptionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subOptions: [{ type: mongoose.Schema.Types.ObjectId, ref: "HelpOption" }],
    isSolution: { type: Boolean, required: true },
    content: { type: String },
    link: { type: String },
    doc: { type: mongoose.Schema.Types.ObjectId, ref: "HelpDoc" },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },

  { timestamps: true }
);

const HelpOption = mongoose.model("HelpOption", helpOptionSchema);
module.exports = HelpOption;
