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
} = require("../utils/mail");
const System = require("../models/system");
const { verifyNin } = require("../utils/nin");
const Log = require("../models/log");
dotenv.config();
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const updateSuperPerc = async (req, res) => {
  const { superPerc } = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { superPerc },
      {
        new: true,
      }
    );

    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }

    res.status(201).send(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ error: "Server error" });
  }
};

const verifyEmail = async (req, res) => {
  const { token } = req.params;

  try {
    const base64UrlDecode = (input) => {
      return input.replace(/\(/g, ".");
    };
    const decodedToken = base64UrlDecode(token);
    const decoded = jwt.verify(
      decodedToken,
      process.env.VERIFICATION_TOKEN_SECRET
    );
    const email = decoded.email;

    await User.findOneAndUpdate({ email }, { isVerified: true });

    return res.status(201).json({
      status: true,
      message: "Email verified successfully",
    });
  } catch (err) {
    return res.status(400).json({
      status: false,
      message: "Invalid or expired token.",
    });
  }
};

const resendToken = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        status: false,
        message: "Email missing",
      });
    }

    const userExists = await User.findOne({ email });
    if (!userExists) {
      return res.status(400).json({
        status: false,
        message: "User does not exist",
      });
    }

    if (userExists.isVerified) {
      return res.status(400).json({
        status: false,
        message: "User is already verified",
      });
    }

    const firstName = userExists.firstName;

    const verificationToken = jwt.sign(
      { email: email },
      process.env.VERIFICATION_TOKEN_SECRET,
      { expiresIn: "1d" }
    );

    const base64UrlEncode = (input) => {
      return input.replace(/\./g, "(");
    };

    const encodedToken = base64UrlEncode(verificationToken);

    let transporter = nodemailer.createTransport({
      host: "mail.proxze.com",
      port: 465,
      secure: true, // use TLS
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
      tls: {
        // do not fail on invalid certs
        rejectUnauthorized: false,
      },
    });

    const msg = {
      to: email,
      from: process.env.MAIL_USER,
      subject: "Verify Your Email",
      text: `Hi ${firstName}, You're almost set to start using Proxze. Please click on the button below to verify your email.: ${process.env.CLIENT_URL}/verify-email/${encodedToken}`,
      html: createVerificationMail({ firstName, email, encodedToken }),
    };

    // sendMail(
    //   msg.subject,
    //   msg.text,
    //   createVerificationMail({ firstName, email, encodedToken }),
    //   [email],
    //   msg
    // );

    // await sgMail
    //   .send(msg)
    //   .then((response) => {
    //     console.log(response[0].statusCode);
    //     console.log(response[0].headers);
    //   })
    //   .catch((error) => {
    //     console.error(error);
    //   });

    // await new Promise((resolve, reject) => {
    //   transporter.sendMail(msg, (err, info) => {
    //     if (err) {
    //       return reject(err);
    //     }
    //     resolve("Email sent");
    //   });
    // });

    return res.status(201).json({
      status: true,
      message: "Verification email resent successfully",
      data: { email, firstName },
    });
  } catch (err) {
    return res.status(500).json({
      status: true,
      message: `Unable to send verification email to user. Please try again.`,
      error: err,
    });
  }
};

const sendVerificationToken = async (req, res) => {
  try {
    const { email, firstName } = req.body;

    if (!email || !firstName) {
      return res.status(400).json({
        status: false,
        message: "Email missing",
      });
    }

    const verificationToken = jwt.sign(
      { email: email },
      process.env.VERIFICATION_TOKEN_SECRET,
      { expiresIn: "1d" }
    );

    const base64UrlEncode = (input) => {
      return input.replace(/\./g, "(");
    };

    const encodedToken = base64UrlEncode(verificationToken);

    let transporter = nodemailer.createTransport({
      host: "mail.proxze.com",
      port: 465,
      secure: true, // use TLS
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
      tls: {
        // do not fail on invalid certs
        rejectUnauthorized: false,
      },
    });

    const msg = {
      to: email,
      from: process.env.MAIL_USER,
      subject: "Verify Your Email",
      text: `Hi ${firstName}, You're almost set to start using Proxze. Please click on the button below to verify your email.: https://${process.env.CLIENT_URL}/verify-email/${encodedToken}`,
      html: createVerificationMail({
        firstName,
        email,
        encodedToken,
        liveUrl: process.env.CLIENT_URL,
      }),
    };

    // await sgMail
    //   .send(msg)
    //   .then((response) => {
    //     console.log(response[0].statusCode);
    //     console.log(response[0].headers);
    //   })
    //   .catch((error) => {
    //     console.error(error);
    //   });

    await new Promise((resolve, reject) => {
      transporter.sendMail(msg, (err, info) => {
        if (err) {
          return reject(err);
        }
        resolve("Email sent");
      });
    });

    return res.status(201).json({
      status: true,
      message: "Verification email resent successfully",
    });
  } catch (err) {
    return res.status(500).json({
      status: true,
      message: `Unable to send verification email to user. Please try again.`,
      error: err,
    });
  }
};

const loginUser = async (req, res) => {
  if (!req.body.email || !req.body.password) {
    return res.status(401).json({
      status: false,
      message: "Email and password required",
    });
  }

  const user = await User.findOne({ email: req.body.email });
  if (user == null) {
    return res.status(401).json({
      status: false,
      message: "User does not exist.",
    });
  }

  if (user.isDeactivated) {
    return res.status(401).json({
      status: false,
      message: "Account has been deactivated.",
    });
  }

  if (!user.isVerified) {
    return res.status(401).json({
      status: false,
      message: "Email has not been verified.",
    });
  }

  try {
    if (await bcrypt.compare(req.body.password, user.password)) {
      const accessToken = jwt.sign({ id: user._id }, process.env.ACCESS_TOKEN);

      if (req.body.token && !user.token.includes(req.body.token)) {
        user.token.push(req.body.token);
        await user.save();
      }

      // if (req.body.location) {
      //   user.location = req.body.location;
      //   await user.save();
      // }

      const userData = {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        userType: user.userType,
        bio: user.bio,
        userToken: accessToken,
        phoneNumber: user.phoneNumber,
        address: user.address,
        state: user.state,
        country: user.country,
        lga: user.lga,
        balance: user.balance,
        avatar: user.avatar,
        bank: user.userBank,
        rating: user.rating,
        // location: user.location,
        accountNumber: user.accountNumber && hideChars(user.accountNumber),
        postalCode: user.postalCode,
      };
      // if (Expo.isExpoPushToken(expoPushToken)) {
      //   await sendPushNotification(expoPushToken, message);
      // }
      const userDto = User.findById(user._id).select(
        "_id firstName lastName email userType bio phoneNumber oplAddress resAddress location avatar balance paymentInfo"
      );
      res.status(200).send(userDto);
    } else {
      res.status(401).send("Invalid Credentials");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};

const getUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);

    return res.status(201).json(user);
  } catch (error) {
    res.status(500).send(error);
  }
};

const updateUserInfo = async (req, res) => {
  const {
    isDeactivated,
    rating,
    password,
    userType,
    balance,
    reviews,
    notifications,
    isDisabled,

    ...updateObject
  } = req.body;

  if (
    isDeactivated ||
    rating ||
    password ||
    userType ||
    balance ||
    reviews ||
    notifications ||
    isDisabled
  ) {
    return res.status(401).json({
      status: false,
      message: "You are not authorized to do that.",
    });
  }

  const user = await User.findById(req.user.id);

  if (
    updateObject.hasOwnProperty("email") &&
    updateObject.email !== user.email
  ) {
    const newEmail = updateObject.email;
    if (await User.findOne({ email: newEmail })) {
      return res.status(409).json({
        status: false,
        message: "User already exists with email",
      });
    }
  }

  try {
    const user = await User.findByIdAndUpdate(req.user.id, updateObject, {
      new: true,
    });

    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }

    const userData = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      userType: user.userType,
      bio: user.bio,
      phoneNumber: user.phoneNumber,
      address: user.address,
      state: user.state,
      country: user.country,
      lga: user.lga,
      balance: user.balance,
      avatar: user.avatar,
      bank: user.userBank,
      rating: user.rating,
      accountNumber: user.accountNumber && hideChars(user.accountNumber),
      postalCode: user.postalCode,
    };

    const userDto = User.findById(user._id).select(
      "_id firstName lastName email userType bio phoneNumber oplAddress resAddress location avatar balance paymentInfo"
    );

    res.status(201).send(userDto);
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ error: "Server error" });
  }
};

const updatePaymentInfo = async (req, res) => {
  const { oldAccountNumber, accountNumber, bank, bankCode, accountName } =
    req.body;

  try {
    const user = await User.findById(req.user.id);
    if (
      user.paymentInfo.accountNumber &&
      oldAccountNumber !== user.paymentInfo.accountNumber
    ) {
      return res.status(401).json({
        status: false,
        message: "Incorrect old account number.",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { paymentInfo: { accountNumber, bank, bankCode, accountName } },
      { new: true }
    );

    const userData = {
      bank: updatedUser.paymentInfo.bank,
      accountNumber: hideChars(updatedUser.paymentInfo.accountNumber),
    };
    console.log(userData);
    res.status(200).send(userData);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: false,
      message: `Unable to update payment info. Please try again.`,
      error: err,
    });
  }
};

const updatePassword = async (req, res) => {
  const { newPassword } = req.body;

  try {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await User.findByIdAndUpdate(req.user.id, { password: hashedPassword });

    return res.status(201).json({
      status: true,
      message: "User created successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
};

const updateLocation = async (req, res) => {
  const { location } = req.body;
  try {
    await User.findByIdAndUpdate(req.user.id, {
      location: {
        type: "Point",
        coordinates: [location.lng, location.lat],
      },
    });

    return res.status(201).json({
      status: true,
      message: "User updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
};

const deactivateAccount = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.userId, { isDeactivated: true });

    return res.status(201).json({
      status: true,
      message: "User successfully deactivated",
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: `Unable to deactivate account. Please try again.`,
      error: err,
    });
  }
};

const deleteAccount = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.userId);

    return res.status(201).json({
      status: true,
      message: "User successfully deleted",
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: `Unable to delete account. Please try again.`,
      error: err,
    });
  }
};

const makeAdmin = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.userId, { userType: "admin" });

    return res.status(201).json({
      status: true,
      message: "User type successfully updated",
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      message: `Unable to change user's user type. Please try again.`,
      error: err,
    });
  }
};

const unlinkSuper = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.userId, {
      $unset: {
        superProxze: "",
        superApproved: "",
        superRejected: "",
        superPerc: "",
      },
    });

    return res.status(201).json({
      status: true,
      message: "Super proxze removed successfully",
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      message: `Unable to remove super proxze. Please try again.`,
      error: err,
    });
  }
};

const getDashboard = async (req, res) => {
  try {
    const users = await User.countDocuments();
    const tasks = await Task.countDocuments();
    const system = await System.findById("6427dcf5e7e46b77b43bb882");
    const balance = system.balance;

    const stats = { users, tasks, balance };

    const dashboard = { stats };

    return res.status(201).json({
      status: true,
      message: "Dashboard fetched",
      data: dashboard,
    });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: `Unable to get earnings. Please try again.`,
      error: err,
    });
  }
};

const getUsers = async (req, res) => {
  try {
    const {
      page = 1,
      search,
      userType,
      isVerified,
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
        {
          $or: [
            { firstName: { $regex: search, $options: "i" } },
            { lastName: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        },
      ],
    };

    if (userType !== undefined && userType !== "")
      query.$and.push({ userType });
    if (isVerified !== undefined && isVerified !== "")
      query.$and.push({ isVerified });
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
    const users = await User.find(query)
      .sort(sortQuery)
      .skip((page - 1) * perPage)
      .limit(perPage);
    const count = await User.countDocuments(query);
    const hasNextPage = page * perPage < count;

    return res.status(201).json({
      status: true,
      message: "Users fetched",
      data: {
        data: { proxzeCount, principalCount, superCount, staffCount },
        count,
        users,
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

const getTasks = async (req, res) => {
  try {
    const {
      page = 1,
      search,
      state,
      lga,
      status,
      type,
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
        {
          $or: [
            { description: { $regex: search, $options: "i" } },
            { "location.label": { $regex: search, $options: "i" } },
          ],
        },
      ],
    };

    if (type !== undefined && type !== "") query.$and.push({ type });
    if (status !== undefined && status !== "") query.$and.push({ status });
    if (state !== undefined && state !== "")
      query.$and.push({ "location.state": state });
    if (lga !== undefined && lga !== "")
      query.$and.push({ "location.lga": lga });
    if (startDate !== undefined && startDate !== "")
      query.$and.push({ createdAt: { $gte: new Date(startDate) } });
    if (endDate !== undefined && endDate !== "")
      query.$and.push({ createdAt: { $lte: new Date(endDate) } });
    if (sortBy !== undefined && sortBy !== "")
      sortQuery[sortBy] = orderBy === "descending" ? 1 : -1;

    const taskCount = await Task.countDocuments();
    const taskpoolCount = await Task.countDocuments({ status: "created" });
    const activeCount = await Task.countDocuments({ status: "started" });
    const tasks = await Task.find(query)
      .sort(sortQuery)
      .skip((page - 1) * perPage)
      .limit(perPage);
    const count = await Task.countDocuments(query);
    const hasNextPage = page * perPage < count;

    return res.status(201).json({
      status: true,
      message: "Tasks fetched",
      data: {
        data: { taskpoolCount, activeCount },
        count,
        tasks,
        hasNextPage,
      },
    });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: `Unable to get tasks. Please try again.`,
      error: err,
    });
  }
};

const removeProxze = async (req, res) => {
  try {
    const { taskId } = req.params;

    await Task.findByIdAndUpdate(
      taskId,
      {
        $unset: { proxze: "" },
        status: "created",
        "offers.$[].isRejected": true, // Set all offers to rejected
        timeline: [{ status: "created", timestamp: new Date() }], // Reset timeline status to 'created'
      },
      { new: true }
    );

    return res.status(201).json({
      status: true,
      message: "Proxze romoved",
    });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: `Unable to get remove proxze. Please try again.`,
      error: err,
    });
  }
};

const getTransactions = async (req, res) => {
  try {
    const {
      page = 1,
      search,
      type,
      purpose,
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
        {
          $or: [
            { summary: { $regex: search, $options: "i" } },
            { transactionSummary: { $regex: search, $options: "i" } },
            { reference: { $regex: search, $options: "i" } },
          ],
        },
      ],
    };

    if (type !== undefined && type !== "")
      query.$and.push({ transactionType: type });
    if (purpose !== undefined && purpose !== "") query.$and.push({ purpose });
    // if (state !== undefined && state !== "")
    //   query.$and.push({ "location.state": state });
    // if (lga !== undefined && lga !== "")
    //   query.$and.push({ "location.lga": lga });
    if (startDate !== undefined && startDate !== "")
      query.$and.push({ createdAt: { $gte: new Date(startDate) } });
    if (endDate !== undefined && endDate !== "")
      query.$and.push({ createdAt: { $lte: new Date(endDate) } });
    if (sortBy !== undefined && sortBy !== "")
      sortQuery[sortBy] = orderBy === "descending" ? 1 : -1;

    const transactionCount = await Transaction.countDocuments();
    const system = await System.findById("6427dcf5e7e46b77b43bb882");
    const balance = system.balance;
    const ledgerBalance = system.ledgerBalance;
    // const taskpoolCount = await Transaction.countDocuments({ status: "created" });
    // const activeCount = await Transaction.countDocuments({ status: "started" });
    const transactions = await Transaction.find(query)
      .populate({
        path: "user",
        select: "_id firstName lastName",
      })
      .sort(sortQuery)
      .skip((page - 1) * perPage)
      .limit(perPage);
    const count = await Transaction.countDocuments(query);
    const hasNextPage = page * perPage < count;

    return res.status(201).json({
      data: { transactionCount, balance, ledgerBalance },
      count,
      transactions,
      hasNextPage,
    });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: `Unable to get transactions. Please try again.`,
      error: err,
    });
  }
};

const bulkEmailVerification = async (req, res) => {
  try {
    const users = await User.find({ isVerified: false });

    for (const user of users) {
      try {
        await sendVerificationMail(user);
      } catch (error) {
        console.error(`Error sending verification mail ${user._id}: ${error}`);
      }
    }

    return res.status(201).json({
      status: true,
      message: "Verification emails sent successfully",
    });
  } catch (error) {
    return res.status(500).json({
      status: true,
      message: `Unable to send verification emails to users. Please try again. \n Error: ${error}`,
    });
  }
};

const bulkNinVerification = async (req, res) => {
  try {
    const users = await User.find({ "ninData.isVerified": false });

    for (const user of users) {
      try {
        await verifyNin(user);
      } catch (error) {
        console.error(`Error verifying NIN for user ${user._id}: ${error}`);
      }
    }

    return res.status(201).json({
      status: true,
      message: "NINs have been verified successfully",
    });
  } catch (error) {
    return res.status(500).json({
      status: true,
      message: `Unable to verify users NIN. Please try again. \n Error: ${error}`,
    });
  }
};

const deleteUnverifiedNinUsers = async (req, res) => {
  try {
    await User.deleteMany({ "ninData.isVerified": false });

    return res.status(201).json({
      status: true,
      message: "Unverified NIN users deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      status: true,
      message: `Unable to delete unverified NIN users. Please try again. \n Error: ${error}`,
    });
  }
};

const getSystemLogs = async (req, res) => {
  try {
    const {
      page = 1,
      search,
      type,
      purpose,
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
        {
          $or: [
            { summary: { $regex: search, $options: "i" } },
            { transactionSummary: { $regex: search, $options: "i" } },
            { reference: { $regex: search, $options: "i" } },
          ],
        },
      ],
    };

    // if (type !== undefined && type !== "")
    //   query.$and.push({ transactionType: type });
    // if (purpose !== undefined && purpose !== "") query.$and.push({ purpose });
    // // if (state !== undefined && state !== "")
    // //   query.$and.push({ "location.state": state });
    // // if (lga !== undefined && lga !== "")
    // //   query.$and.push({ "location.lga": lga });
    // if (startDate !== undefined && startDate !== "")
    //   query.$and.push({ createdAt: { $gte: new Date(startDate) } });
    // if (endDate !== undefined && endDate !== "")
    //   query.$and.push({ createdAt: { $lte: new Date(endDate) } });
    // if (sortBy !== undefined && sortBy !== "")
    //   sortQuery[sortBy] = orderBy === "descending" ? 1 : -1;

    const logCount = await Log.countDocuments();
    const logs = await Log.find();

    // const count = await Transaction.countDocuments(query);
    // const hasNextPage = page * perPage < count;

    return res.status(201).json({
      data: logs,
      // count,
      // transactions,
      // hasNextPage,
    });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: `Unable to get system logs. Please try again.`,
      error: err,
    });
  }
};

module.exports = {
  verifyEmail,
  sendVerificationToken,
  resendToken,
  loginUser,
  getUser,
  getUsers,
  getTasks,
  getTransactions,
  getDashboard,
  updateUserInfo,
  updatePaymentInfo,
  updatePassword,
  updateLocation,
  deactivateAccount,
  deleteAccount,
  bulkEmailVerification,
  bulkNinVerification,
  deleteUnverifiedNinUsers,
  updateSuperPerc,
  makeAdmin,
  unlinkSuper,
  removeProxze,
  getSystemLogs,
};
