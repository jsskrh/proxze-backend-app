const mongoose = require("mongoose");

const organizationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    certificateOfIncorporation: { type: String, required: true, trim: true },
    taxIdentificationNumber: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
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
          enum: ["Officer", "Supervisor"],
        },
      },
    ],
    pending: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    ],
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],
  },
  { timestamps: true }
);

const Organization = mongoose.model("Organization", organizationSchema);
module.exports = Organization;
