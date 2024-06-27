const User = require("../models/user");
const Task = require("../models/task");
const Transaction = require("../models/transaction");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const sgMail = require("@sendgrid/mail");
const nodemailer = require("nodemailer");
const {
  hideChars,
  getAverageRating,
  sortDataByDate,
} = require("../utils/helpers");
const { sendPushNotification } = require("../utils/pushNotifications");
const {
  createVerificationMail,
  sendVerificationMail,
  sendRegistrationMail,
} = require("../utils/mail");
const System = require("../models/system");
const { verifyNin } = require("../utils/nin");
dotenv.config();
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const addProxze = async (req, res) => {
  try {
    const { email } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(409).json({
        status: false,
        message: "User already exists with email",
      });
    }

    const user = await User.create({
      email,
      superProxze: req.user.id,
      userType: "proxze",
    });

    await User.findByIdAndUpdate(req.user.id, {
      $push: { subProxzes: user._id },
    });

    await sendRegistrationMail(user);

    return res.status(201).json({
      status: true,
      message: "Successfully added proxy",
    });
  } catch (err) {
    return res.status(500).json({
      status: true,
      message: `Unable to add proxy. Please try again.`,
      error: err,
    });
  }
};

const addSingleProxze = async (email, userId) => {
  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new Error(`User already exists with email: ${email}`);
  }

  const user = await User.create({
    email,
    superProxze: userId,
    userType: "proxze",
  });

  await User.findByIdAndUpdate(userId, {
    $push: { subProxzes: user._id },
  });

  await sendRegistrationMail(user);
};

const addBulkProxze = async (req, res) => {
  try {
    const { emails } = req.body; // Expecting an array of emails

    const addAllProxzes = emails.map((email) =>
      addSingleProxze(email, req.user.id)
    );
    await Promise.all(addAllProxzes);

    return res.status(201).json({
      status: true,
      message: "Successfully added all proxies",
    });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: `Unable to add some or all proxies. Please try again.`,
      error: err.message || err,
    });
  }
};

const getSubProxzes = async (req, res) => {
  try {
    const { id } = req.user;

    const user = await User.findById(id).populate("subProxzes");

    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    console.log("User:", user);
    console.log("SubProxzes:", user.subProxzes);

    return res.status(200).json({
      status: true,
      message: "Successfully fetched proxies",
      data: user.subProxzes,
    });
  } catch (err) {
    return res.status(500).json({
      status: true,
      message: `Unable to get proxies. Please try again.`,
      error: err,
    });
  }
};

module.exports = {
  addProxze,
  addBulkProxze,
  getSubProxzes,
};
