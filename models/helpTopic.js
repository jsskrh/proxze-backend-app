const mongoose = require("mongoose");

const helpTopicSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    docs: [{ type: mongoose.Schema.Types.ObjectId, ref: "HelpDoc" }],
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },

  { timestamps: true }
);

const HelpTopic = mongoose.model("HelpTopic", helpTopicSchema);
module.exports = HelpTopic;
