const mongoose = require("mongoose");

const helpTopicSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    docs: [{ type: mongoose.Schema.Types.ObjectId, ref: "HelpDoc" }],
  },

  { timestamps: true }
);

const HelpTopic = mongoose.model("HelpTopic", helpTopicSchema);
module.exports = HelpTopic;
