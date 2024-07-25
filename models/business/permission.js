const mongoose = require("mongoose");

const PermissionSchema = new mongoose.Schema({
  group: {
    type: Object,
    default: { list: false, create: false, edit: false, delete: false },
  },
  proxy: {
    type: Object,
    default: { view: false, deactivate: false, activate: false },
  },
  class: {
    type: String,
    enum: ["class1", "class2", "class3", "class4", "class5"],
  },
  principalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

module.exports = mongoose.model("Permission", PermissionSchema);
