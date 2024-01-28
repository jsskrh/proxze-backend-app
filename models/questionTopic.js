const mongoose = require("mongoose");

const questionTopicSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, unique: true },
    icon: { type: String, required: true },
    options: [{ type: mongoose.Schema.Types.ObjectId, ref: "HelpOption" }],
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },

  { timestamps: true }
);

const QuestionTopic = mongoose.model("QuestionTopic", questionTopicSchema);
module.exports = QuestionTopic;
