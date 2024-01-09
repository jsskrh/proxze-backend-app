const mongoose = require("mongoose");

const helpDocSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    body: { type: String, required: true },
  },

  { timestamps: true }
);

const HelpDoc = mongoose.model("HelpDoc", helpDocSchema);
module.exports = HelpDoc;
