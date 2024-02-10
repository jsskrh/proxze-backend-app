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
const { createVerificationMail } = require("../utils/mail");
dotenv.config();
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

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
      message: `Unable to send verification email to user. Please try again. \n Error: ${err}`,
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
      text: `Hi ${firstName}, You're almost set to start using Proxze. Please click on the button below to verify your email.: https://www.proxze.com/verify-email/${encodedToken}`,
      html: createVerificationMail({
        firstName,
        email,
        encodedToken,
        liveUrl: "https://www.proxze.com",
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
      message: `Unable to send verification email to user. Please try again. \n Error: ${err}`,
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
      res.status(200).send(userData);
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
    const user = await User.findById(req.user.id);
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
      paymentInfo: {
        bank: user.paymentInfo?.bank,
        accountName: user.paymentInfo?.accountName,
        bankCode: user.paymentInfo?.bankCode,
        accountNumber:
          user.paymentInfo?.accountNumber &&
          hideChars(user.paymentInfo?.accountNumber),
      },
      rating: getAverageRating(user.reviews),
      postalCode: user.postalCode,
    };
    res.status(201).send(userData);
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

    res.status(201).send(userData);
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
      message: `Unable to update payment info. Please try again. \n Error: ${err}`,
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
    await User.findByIdAndUpdate(req.user.id, { isDeactivated: true });

    return res.status(201).json({
      status: true,
      message: "User successfully deactivated",
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
};

const getDashboard = async (req, res) => {
  try {
    const users = await User.find();
    const tasks = await Task.find();

    const stats = { users: users.length, tasks: tasks.length };

    const dashboard = { stats };

    return res.status(201).json({
      status: true,
      message: "Dashboard fetched",
      data: dashboard,
    });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: `Unable to get earnings. Please try again. \n Error: ${err}`,
    });
  }
};

const getUsers = async (req, res) => {
  try {
    const { page = 1, search, userType } = req.query;
    const perPage = 15;
    let query = {};

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

    if (userType !== undefined && userType !== "") {
      query.$and.push({ userType });
    }

    console.log(query);

    const users = await User.find(query)
      .skip((page - 1) * perPage)
      .limit(perPage);
    const count = await User.countDocuments(query);
    const hasNextPage = page * perPage < count;

    return res.status(201).json({
      status: true,
      message: "Users fetched",
      data: { count, users, hasNextPage },
    });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: `Unable to get users. Please try again. \n Error: ${err}`,
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
  getDashboard,
  updateUserInfo,
  updatePaymentInfo,
  updatePassword,
  updateLocation,
  deactivateAccount,
};
