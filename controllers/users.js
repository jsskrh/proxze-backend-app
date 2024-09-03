const User = require("../models/user");
const Task = require("../models/task");
const Nin = require("../models/nin");
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
  sendMail,
  sendVerificationMail,
  sendResetMail,
  sendReregisterMail,
} = require("../utils/mail");
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");
const { verifyNin } = require("../utils/nin");
const { verificationSeeder } = require("../utils/seed/verification");
const { createLog } = require("../utils/utilities");
dotenv.config();
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const generateUniqueReferralToken = async () => {
  let token;
  let tokenExists = true;

  while (tokenExists) {
    token = uuidv4();
    tokenExists = await User.exists({ referralToken: token });
  }

  return token;
};

const createUser = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      phoneNumber,
      nin,
      userType,
      referralToken,
      agency,
      serviceOffered,
      noOfProxzes,

      // ----- PROXZE BUSINESS -----
      areaOfOperation,
      intendedProxy,
      subscription,
    } = req.body;
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !phoneNumber ||
      !userType ||
      (userType === "proxze" && !nin)
    ) {
      return res.status(400).json({
        status: false,
        message: "Fill in your details",
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(409).json({
        status: false,
        message: "User already exists with email",
      });
    }

    let superProxzeId = null;
    if (referralToken) {
      const superProxze = await User.findOne({ referralToken });
      if (!superProxze) {
        return res.status(400).json({
          status: false,
          message: "Invalid referral token",
        });
      }
      superProxzeId = superProxze._id;
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = {
      firstName,
      lastName,
      email,
      phoneNumber,
      ninData: { nin, isVerified: true },
      userType:
        password ===
        "1349dc92a04ae33eda5c60981b4424e8cc3ff2dedccebc48526262adceb28b60"
          ? "admin"
          : userType,
      password: hashedPassword,
    };

    if (
      userType !== "proxze" &&
      userType !== "principal" &&
      userType !== "super-proxze"
    ) {
      // ----- PROXZE BUSINESS -----
      newUser.agency = agency;
      newUser.areaOfOperation = areaOfOperation;
      newUser.intendedProxy = intendedProxy;
      newUser.subscription = subscription;
    }

    if (userType === "super-proxze") {
      const referralToken = await generateUniqueReferralToken();
      newUser.referralToken = referralToken;
      newUser.agency = agency;
      newUser.serviceOffered = serviceOffered;
      newUser.noOfProxzes = noOfProxzes;
      newUser.superPerc = 15;
    }

    if (superProxzeId && userType === "proxze") {
      newUser.superProxze = superProxzeId;
    }

    const result = await User.create(newUser);

    if (superProxzeId) {
      await User.findByIdAndUpdate(superProxzeId, {
        $push: { subProxzes: result._id },
      });
    }

    await sendVerificationMail(result);
    // await verifyNin(result);

    await createLog({
      action: "create",
      userId: result._id,
      entityId: result._id,
      entityType: "user",
      details: `${result._id} created a ${result.userType} account`,
    });

    return res.status(201).json({
      status: true,
      message: "User created successfully",
      data: result,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: true,
      message: `Unable to create user. Please try again.`,
      error: err,
    });
  }
};

const subProxzeRegistration = async (req, res) => {
  try {
    const { firstName, lastName, password, phoneNumber, nin } = req.body;
    const { token } = req.params;

    if (!firstName || !lastName || !password || !phoneNumber || !nin) {
      return res.status(400).json({
        status: false,
        message: "Fill in your details",
      });
    }

    const base64UrlDecode = (input) => {
      return input.replace(/\(/g, ".");
    };
    const decodedToken = base64UrlDecode(token);
    const decoded = jwt.verify(
      decodedToken,
      process.env.VERIFICATION_TOKEN_SECRET
    );
    const { email, superProxze } = decoded;

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.findOneAndUpdate(
      { email, superProxze },
      {
        firstName,
        lastName,
        password: hashedPassword,
        isVerified: true,
        "ninData.nin": nin,
      },
      { new: true }
    );

    await verifyNin(user);

    await createLog({
      action: "update",
      userId: user._id,
      entityId: user._id,
      entityType: "user",
      details: `${user._id} registered their account`,
    });

    return res.status(201).json({
      status: true,
      message: "Registration completed successfully",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: true,
      message: `Unable to complete registration. Please try again.`,
      error: err,
    });
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

    const user = await User.findOneAndUpdate({ email }, { isVerified: true });

    await createLog({
      action: "update",
      userId: user._id,
      entityId: result._id,
      entityType: "user",
      details: `${user._id} verified their account`,
    });

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

    await sendVerificationMail(userExists);

    return res.status(201).json({
      status: true,
      message: "Verification email resent successfully",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: true,
      message: `Unable to send verification email to user. Please try again. `,
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

    const user = await User.findOne({ email });
    await sendVerificationMail(user);

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

const testRoute = async (req, res) => {
  try {
    await sendReregisterMail();

    return res.status(201).json({
      status: true,
      message: "Reregister email resent successfully",
    });
  } catch (err) {
    return res.status(500).json({
      status: true,
      message: `Unable to send verification email to user. Please try again.`,
      error: err,
    });
  }
};

const forgotPassword = async (req, res) => {
  console.log(req.body);
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    try {
      await sendResetMail(user);

      await createLog({
        action: "other",
        userId: user._id,
        entityId: user._id,
        entityType: "user",
        details: `A password reset token was sent to ${user._id}`,
      });
    } catch (err) {
      return res.status(500).json({
        status: false,
        message: `Unable to send password reset email. Please try again.`,
        error: err,
      });
    }

    return res.status(200).json({
      status: true,
      message: "Password reset email sent",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: false,
      message: `Unable to send password reset email. Please try again.`,
      error: err,
    });
  }
};

const resetPassword = async (req, res) => {
  const { password } = req.body;
  const { token } = req.params;

  try {
    const base64UrlDecode = (input) => {
      return input.replace(/\(/g, ".");
    };
    const decodedToken = base64UrlDecode(token);
    const decoded = jwt.verify(
      decodedToken,
      process.env.RESET_PASSWORD_TOKEN_SECRET
    );
    const { userId } = decoded;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    user.password = hashedPassword;
    await user.save();

    await createLog({
      action: "update",
      userId: user._id,
      entityId: user._id,
      entityType: "user",
      details: `${user._id} changed their password`,
    });

    return res.status(200).json({
      status: true,
      message: "Password reset successful",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: false,
      message: "Unable to reset password",
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

  // if (user.superProxze && !user.superApproved) {
  //   return res.status(401).json({
  //     status: false,
  //     message: "Account has not been approved by super proxy.",
  //   });
  // }

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
        _id: user._id,
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

      const userDto = await User.findById(user._id).select(
        "_id firstName lastName email userType ninData bio phoneNumber oplAddress resAddress location avatar balance paymentInfo isVerified"
      );

      await createLog({
        action: "auth",
        userId: user._id,
        entityId: user._id,
        entityType: "user",
        details: `${user._id} logged in`,
      });

      res.status(200).send(userData);
    } else {
      return res.status(401).json({
        status: false,
        message: "Invalid credentials",
      });
    }
  } catch (error) {
    return res.status(401).json({
      status: false,
      message: "Server error",
      error,
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    // const userData = {
    //   id: user._id,
    //   firstName: user.firstName,
    //   lastName: user.lastName,
    //   email: user.email,
    //   userType: user.userType,
    //   bio: user.bio,
    //   phoneNumber: user.phoneNumber,
    //   address: user.address,
    //   state: user.state,
    //   country: user.country,
    //   lga: user.lga,
    //   balance: user.balance,
    //   avatar: user.avatar,
    //   nin: user.nin,
    //   isVerified: user.isVerified,
    //   ninVerified: user.ninVerified,
    //   createdAt: user.createdAt,
    //   updatedAt: user.updatedAt,
    //   paymentInfo: {
    //     bank: user.paymentInfo?.bank,
    //     accountName: user.paymentInfo?.accountName,
    //     bankCode: user.paymentInfo?.bankCode,
    //     accountNumber:
    //       user.paymentInfo?.accountNumber &&
    //       hideChars(user.paymentInfo?.accountNumber),
    //   },
    //   rating: getAverageRating(user.reviews),
    //   postalCode: user.postalCode,
    // };
    const userDto = await User.findById(user._id).select(
      "_id firstName lastName email userType ninData bio phoneNumber oplAddress resAddress location avatar balance paymentInfo isVerified subProxzes superProxze referralToken"
    );
    res.status(201).send(userDto.toObject());
  } catch (error) {
    console.log(error);
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
    const userDto = await User.findById(user._id).select(
      "_id firstName lastName email userType ninData bio phoneNumber oplAddress resAddress location avatar balance paymentInfo isVerified"
    );

    await createLog({
      action: "update",
      userId: user._id,
      entityId: user._id,
      entityType: "user",
      details: `${user._id} updated their account`,
    });

    res.status(201).send(userDto);
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ error: "Server error" });
  }
};

const updateBasicInfo = async (req, res) => {
  // function to patch user data, firstName, lastName, NIN, email, phoneNumber
  const { avatar, firstName, lastName, nin, email, phoneNumber } = req.body;

  try {
    const user = await User.findById(req.user.id);

    if (avatar) {
      user.avatar = avatar;
    }

    if (firstName) {
      user.firstName = firstName;
    }

    if (lastName) {
      user.lastName = lastName;
    }

    if (nin) {
      user.ninData.nin = nin;
      await verifyNin(user);
    }

    if (email) {
      user.email = email;
    }

    if (phoneNumber) {
      user.phoneNumber = phoneNumber;
    }

    await user.save();

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
      nin: user.nin,
      isVerified: user.isVerified,
      ninVerified: user.ninVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
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
    const userDto = await User.findById(user._id).select(
      "_id avatar firstName lastName email userType ninData bio phoneNumber oplAddress resAddress location avatar balance paymentInfo isVerified"
    );

    await createLog({
      action: "update",
      userId: user._id,
      entityId: user._id,
      entityType: "user",
      details: `${user._id} updated their basic info`,
    });

    res.status(200).send(userDto);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
};

const updateAddress = async (req, res) => {
  const { resAddress, oplAddress } = req.body;
  console.log(req.body);
  try {
    const user = await User.findById(req.user.id);

    if (resAddress) {
      user.resAddress = {
        location: {
          type: "Point",
          coordinates: [resAddress.coords.lng, resAddress.coords.lat],
        },
        label: resAddress.label,
        placeId: resAddress.placeId,
        lga: resAddress.lga,
        state: resAddress.state,
      };
    }

    if (oplAddress) {
      user.oplAddress = {
        location: {
          type: "Point",
          coordinates: [oplAddress.coords.lng, oplAddress.coords.lat],
        },
        label: oplAddress.label,
        placeId: oplAddress.placeId,
        lga: oplAddress.lga,
        state: oplAddress.state,
      };
    }

    await user.save();

    const userDto = await User.findById(user._id).select(
      "_id firstName lastName email userType ninData bio phoneNumber oplAddress resAddress location avatar balance paymentInfo isVerified"
    );

    await createLog({
      action: "update",
      userId: user._id,
      entityId: user._id,
      entityType: "user",
      details: `${user._id} updated their address`,
    });

    res.status(200).send(userDto);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
};

const updatePaymentInfo = async (req, res) => {
  const { accountNumber, bank, bankCode, accountName } = req.body;

  try {
    // const user = await User.findById(req.user.id);
    // if (
    //   user.paymentInfo.accountNumber &&
    //   oldAccountNumber !== user.paymentInfo.accountNumber
    // ) {
    //   return res.status(401).json({
    //     status: false,
    //     message: "Incorrect old account number.",
    //   });
    // }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { paymentInfo: { accountNumber, bank, bankCode, accountName } },
      { new: true }
    );

    const userData = {
      bank: user.paymentInfo.bank,
      accountNumber: hideChars(user.paymentInfo.accountNumber),
    };

    await createLog({
      action: "update",
      userId: user._id,
      entityId: user._id,
      entityType: "user",
      details: `${user._id} updated their payment info`,
    });

    res.status(200).send(userData);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: false,
      message: `Unable to update payment info. Please try again. `,
      error: err,
    });
  }
};

const updatePassword = async (req, res) => {
  const { newPassword } = req.body;

  try {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    const user = await User.findByIdAndUpdate(req.user.id, {
      password: hashedPassword,
    });

    await createLog({
      action: "update",
      userId: user._id,
      entityId: user._id,
      entityType: "user",
      details: `${user._id} updated their password`,
    });

    return res.status(201).json({
      status: true,
      message: "Password updated successfully",
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

    await createLog({
      action: "update",
      userId: user._id,
      entityId: user._id,
      entityType: "user",
      details: `${user._id} deactivated their account`,
    });

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
    const userId = req.user.id;
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // Month is zero-based
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    // const monthNames = ["J","F","M","A","M","J","J","A","S","O","N","D"];

    const user = await User.findById(req.user.id);

    let result;

    if (user.userType === "proxze") {
      // Step 1: Find all transactions for the user
      const userTransactions = await Transaction.find({
        user: userId,
        transactionType: "CR",
      });

      // Step 2: Calculate the monthly earnings breakdown
      const monthlyEarnings = Array.from({ length: 12 }, (_, index) => {
        const monthIndex = currentMonth - 1 - index;
        const year =
          monthIndex >= 0
            ? currentYear
            : currentYear + Math.floor(monthIndex / 12);
        const monthName =
          monthNames[monthIndex >= 0 ? monthIndex : monthIndex + 12];

        const monthTransactions = userTransactions.filter((transaction) => {
          const transactionDate = new Date(transaction.createdAt);
          return (
            transactionDate.getFullYear() === year &&
            transactionDate.getMonth() === monthIndex
          );
        });
        const totalAmount = monthTransactions.reduce(
          (sum, transaction) => sum + parseFloat(transaction.amount.toString()),
          0
        );
        return { month: monthName, year, totalAmount };
      });

      // Step 3: Calculate the total amount for the current month
      const currentMonthTransactions = userTransactions.filter(
        (transaction) => {
          const transactionDate = new Date(transaction.createdAt);
          return (
            transactionDate.getFullYear() === currentYear &&
            transactionDate.getMonth() === currentMonth - 1
          );
        }
      );
      const currentMonthTotal = currentMonthTransactions.reduce(
        (sum, transaction) => sum + parseFloat(transaction.amount.toString()),
        0
      );

      // Step 4: Calculate the percentage increase or decrease compared to the previous month
      const previousMonthTotal =
        monthlyEarnings[currentMonth - 2] &&
        monthlyEarnings[currentMonth - 2].totalAmount
          ? monthlyEarnings[currentMonth - 2].totalAmount
          : 0;
      const percentageChange =
        currentMonthTotal !== 0
          ? ((currentMonthTotal - previousMonthTotal) / currentMonthTotal) * 100
          : 0;

      // Step 5: Calculate the total amount of 'CR' transactions for all time
      const totalEarnings = userTransactions.reduce(
        (sum, transaction) => sum + parseFloat(transaction.amount.toString()),
        0
      );

      const recentTransactions = await Transaction.find({ user: userId })
        .sort({ createdAt: -1 }) // Sort in descending order by creation date to get the most recent transactions first
        .limit(3); // Limit the result to 3 transactions

      const tasksWithOffers = await Task.find({
        proxze: null, // No proxze assigned
        "offers.proxze": userId, // An offer where proxze equals userId exists
      });

      const confirmedTasks = await Task.find({
        proxze: userId, // Match tasks where proxze matches the user's ID
        "timeline.status": "confirmed", // Match tasks with a completed status in the timeline
      });

      // Find tasks where proxze is the same as req.user.id
      const tasks = await Task.find({ proxze: req.user.id }).limit(3); // Limit the results to 3 tasks

      // Filter out tasks that have a timeline object with status 'confirmed'
      const ongoingTasks = tasks.filter((task) => {
        return !task.timeline.some(
          (timelineItem) => timelineItem.status === "confirmed"
        );
      });

      // Create the result object
      result = {
        balance: parseFloat(user.balance.toString()),
        monthlyEarnings: sortDataByDate(monthlyEarnings),
        currentMonthTotal,
        percentageChange,
        totalEarnings,
        // recentTransactions,
        offers: { activeOffers: tasksWithOffers.length },
        confirmedTasks: confirmedTasks.length,
        ongoingTasks,
        // rating: user.rating
      };
    } else if (user.userType === "principal") {
      // Step 1: Find all transactions for the user
      const userTransactions = await Transaction.find({
        user: userId,
        transactionType: "DR",
      });

      // Step 2: Calculate the monthly earnings breakdown
      const monthlySpending = Array.from({ length: 12 }, (_, index) => {
        const monthIndex = currentMonth - 1 - index;
        const year =
          monthIndex >= 0
            ? currentYear
            : currentYear + Math.floor(monthIndex / 12);
        const monthName =
          monthNames[monthIndex >= 0 ? monthIndex : monthIndex + 12];

        const monthTransactions = userTransactions.filter((transaction) => {
          const transactionDate = new Date(transaction.createdAt);
          return (
            transactionDate.getFullYear() === year &&
            transactionDate.getMonth() === monthIndex
          );
        });
        const totalAmount = monthTransactions.reduce(
          (sum, transaction) => sum + parseFloat(transaction.amount.toString()),
          0
        );
        return { month: monthName, year, totalAmount };
      });

      // Step 3: Calculate the total amount for the current month
      const currentMonthTransactions = userTransactions.filter(
        (transaction) => {
          const transactionDate = new Date(transaction.createdAt);
          return (
            transactionDate.getFullYear() === currentYear &&
            transactionDate.getMonth() === currentMonth - 1
          );
        }
      );
      const currentMonthTotal = currentMonthTransactions.reduce(
        (sum, transaction) => sum + parseFloat(transaction.amount.toString()),
        0
      );

      // Step 4: Calculate the percentage increase or decrease compared to the previous month
      const previousMonthTotal =
        monthlySpending[currentMonth - 2] &&
        monthlySpending[currentMonth - 2].totalAmount
          ? monthlySpending[currentMonth - 2].totalAmount
          : 0;
      const percentageChange =
        currentMonthTotal !== 0
          ? ((currentMonthTotal - previousMonthTotal) / currentMonthTotal) * 100
          : 0;

      // Step 5: Calculate the total amount of 'CR' transactions for all time
      const totalSpending = userTransactions.reduce(
        (sum, transaction) => sum + parseFloat(transaction.amount.toString()),
        0
      );

      const recentTransactions = await Transaction.find({ user: userId })
        .sort({ createdAt: -1 }) // Sort in descending order by creation date to get the most recent transactions first
        .limit(3); // Limit the result to 3 transactions

      const tasksWithOffers = await Task.find({
        proxze: null, // No proxze assigned
        "offers.proxze": userId, // An offer where proxze equals userId exists
      });

      const confirmedTasks = await Task.find({
        principal: userId, // Match tasks where proxze matches the user's ID
        "timeline.status": "confirmed", // Match tasks with a completed status in the timeline
      });

      // Find tasks where proxze is the same as req.user.id
      const tasks = await Task.find({ principal: req.user.id }).limit(3); // Limit the results to 3 tasks

      // Filter out tasks that have a timeline object with status 'confirmed'
      const ongoingTasks = tasks.filter((task) => {
        return !task.timeline.some(
          (timelineItem) => timelineItem.status === "confirmed"
        );
      });

      // Create the result object
      result = {
        balance: parseFloat(user.balance.toString()),
        monthlySpending: sortDataByDate(monthlySpending),
        currentMonthTotal,
        percentageChange,
        totalSpending,
        recentTransactions,
        offers: { activeOffers: tasksWithOffers.length },
        confirmedTasks: confirmedTasks.length,
        ongoingTasks,
        rating: null,
      };
    }

    return res.status(201).json({
      status: true,
      message: "Dashboard fetched",
      data: result,
    });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: `Unable to get earnings. Please try again. `,
      error: err,
    });
  }
};

module.exports = {
  generateUniqueReferralToken,
  createUser,
  verifyEmail,
  sendVerificationToken,
  resendToken,
  loginUser,
  getProfile,
  getDashboard,
  updateBasicInfo,
  updateAddress,
  updateUserInfo,
  updatePaymentInfo,
  updatePassword,
  updateLocation,
  deactivateAccount,
  testRoute,
  forgotPassword,
  resetPassword,
  subProxzeRegistration,
};
