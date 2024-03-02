const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    type: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    bill: { type: Number, required: true, trim: true },
    // educationLevel: { type: String, required: true, trim: true },
    // isCertified: { type: Boolean, required: true, trim: true },
    // lga: { type: String, required: true, trim: true },
    // state: { type: String, required: true, trim: true },
    // address: { type: String, required: true, trim: true },
    // location: {
    //   label: { type: String, required: true, trim: true },
    //   coords: {
    //     lat: { type: mongoose.Types.Decimal128, required: true, trim: true },
    //     lng: { type: mongoose.Types.Decimal128, required: true, trim: true },
    //   },
    // },

    location: {
      label: { type: String, required: true, trim: true },
      geometry: {
        type: {
          type: String,
          enum: ["Point"],
          // default: "Point",
        },
        coordinates: {
          type: [Number],
          // default: [0, 0],
        },
      },
      state: { type: String, trim: true },
      lga: { type: String, trim: true },
    },
    // occupation: { type: String, required: true, trim: true },
    // searchRange: { type: String, required: true, trim: true },
    // skillLevel: { type: String, required: true, trim: true },
    // timeBlock: { type: String, required: true, trim: true },
    // yearsOfExperience: { type: String, required: true, trim: true },
    live: { type: Boolean, default: false, trim: true },
    timeline: [
      {
        // status: { type: String, required: true, trim: true },
        status: { type: String, trim: true },
        timestamp: {
          type: Date,
          // required: true,
          default: Date.now(),
          trim: true,
        },
      },
    ],
    status: {
      type: String,
      default: "created",
      trim: true,
      // enum: Object.values(states),
    },
    startDate: { type: Date, required: true, trim: true },
    endDate: { type: Date, required: true, trim: true },
    principal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      // required: true,
    },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      // required: true,
    },
    proxzeReview: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review",
    },
    principalReview: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review",
    },
    proxze: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    rejects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    offers: [
      {
        proxze: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          // required: true,
        },
        chat: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Chat",
          // required: true,
        },
        coverLetter: { type: String },
        timestamp: {
          type: Date,
          trim: true,
        },
        isRejected: { type: Boolean, default: false },
        // proposal: { type: String, required: true },
      },
    ],
    paymentStatus: { type: Boolean, default: false },
    principalPayment: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Transaction",
      },
    ],
    proxzePayment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction",
    },

    attachments: [
      // {
      //   type: mongoose.Schema.Types.ObjectId,
      //   ref: "Stream",
      // },
      {
        type: { type: String },
        url: { type: String },
        location: { type: String },
        timestamp: {
          type: Date,
          trim: true,
        },
        size: { type: Number },
        duration: { type: Number },
      },
    ],
    lastViewed: { type: Date, trim: true },
  },
  { timestamps: true }
);

taskSchema.index({ location: { geometry: "2dsphere" } });
const Task = mongoose.model("Task", taskSchema);
module.exports = Task;
