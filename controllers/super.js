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
    const { email} = req.body;

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
    const {
      page = 1,
      search,
      isVerified,
      isApproved,
      state,
      lga,
      sortBy,
      orderBy,
      startDate,
      endDate,
    } = req.query;
    const perPage = 15;
    let query = {};
    let sortQuery = {};

    query = {
      $and: [
        { superProxze: req.user.id },
        { userType: "proxze" },
        {
          $or: [
            { firstName: { $regex: search, $options: "i" } },
            { lastName: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        },
      ],
    };

    if (isVerified !== undefined && isVerified !== "")
      query.$and.push({ isVerified });
    if (isApproved !== undefined && isApproved !== "") {
      query.$and.push({ superApproved: isApproved });
    } else {
      query.$and.push({ superApproved: { $exists: false } });
    }
    if (state !== undefined && state !== "")
      query.$and.push({
        $or: [{ "resAddress.state": state }, { "address.state": state }],
      });
    if (lga !== undefined && lga !== "")
      query.$and.push({
        $or: [{ "resAddress.lga": lga }, { "address.lga": lga }],
      });
    if (startDate !== undefined && startDate !== "")
      query.$and.push({ createdAt: { $gte: new Date(startDate) } });
    if (endDate !== undefined && endDate !== "")
      query.$and.push({ createdAt: { $lte: new Date(endDate) } });
    if (sortBy !== undefined && sortBy !== "")
      sortQuery[sortBy] = orderBy === "descending" ? 1 : -1;

    const userCount = await User.countDocuments(query);
    const proxzeCount = await User.countDocuments({ userType: "proxze" });
    const principalCount = await User.countDocuments({ userType: "principal" });
    const superCount = await User.countDocuments({ userType: "super-proxze" });
    const staffCount = await User.countDocuments({ userType: "admin" });
    const proxzes = await User.find(query)
      .sort(sortQuery)
      .skip((page - 1) * perPage)
      .limit(perPage);
    const count = await User.countDocuments(query);
    const hasNextPage = page * perPage < count;
    console.log(query, proxzes);
    return res.status(201).json({
      status: true,
      message: "Sub proxzes fetched",
      data: {
        count,
        proxzes,
        hasNextPage,
      },
    });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: `Unable to get users. Please try again.`,
      error: err,
    });
  }
};

const approveProxze = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findOneAndUpdate(
      {
        _id: userId,
        superProxze: req.user.id,
      },
      { superApproved: true },
      { new: true }
    );

    if (!user) {
      return res.status(400).json({
        status: false,
        message: `Unable to approve user. User does not exist.`,
      });
    }

    return res.status(201).json({
      status: true,
      message: "Sub proxze approved",
      data: user,
    });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: `Unable to approve user. Please try again.`,
      error: err,
    });
  }
};

const rejectProxze = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findOneAndUpdate(
      {
        _id: userId,
        superProxze: req.user.id,
      },
      { superApproved: false },
      { new: true }
    );

    if (!user) {
      return res.status(400).json({
        status: false,
        message: `Unable to reject user. User does not exist.`,
      });
    }

    return res.status(201).json({
      status: true,
      message: "Sub proxze rejected",
      data: user,
    });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: `Unable to reject user. Please try again.`,
      error: err,
    });
  }
};

module.exports = {
  addProxze,
  addBulkProxze,
  getSubProxzes,
  approveProxze,
  rejectProxze,
};
