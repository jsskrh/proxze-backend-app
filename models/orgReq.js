const mongoose = require("mongoose");

const orgReqSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    rcNumber: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    phoneNumber: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    initiator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    accountManager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      default: "waiting",
      enum: ["waiting", "pending", "approved", "rejected"],
    },
  },
  { timestamps: true }
);

const OrgReq = mongoose.model("OrgReq", orgReqSchema);
module.exports = OrgReq;
