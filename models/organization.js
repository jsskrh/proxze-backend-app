const mongoose = require("mongoose");

const organizationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    rcNumber: { type: String, required: true, trim: true, unique: true },
    email: { type: String, required: true, trim: true, unique: true },
    phoneNumber: { type: String, required: true, trim: true, unique: true },
    address: { type: String, required: true, trim: true, unique: true },
    request: { type: mongoose.Schema.Types.ObjectId, ref: "OrgReq" },
    accountManager: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    members: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        role: {
          type: String,
          required: true,
          trim: true,
          enum: ["officer", "supervisor"],
        },
        pending: { type: Boolean, default: false },
      },
    ],
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],
  },
  { timestamps: true }
);

const Organization = mongoose.model("Organization", organizationSchema);
module.exports = Organization;
