const User = require("../models/user");
const Task = require("../models/task");
const Transaction = require("../models/transaction");
const bcrypt = require("bcrypt");
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
dotenv.config();
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const createUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phoneNumber, nin, userType } =
      req.body;
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !phoneNumber ||
      !nin ||
      !userType
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

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    const result = await User.create({
      firstName,
      lastName,
      email,
      phoneNumber,
      nin,
      userType,
      password: hashedPassword,
    });

    const verificationToken = jwt.sign(
      { email: result.email },
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
      to: result.email,
      from: "no-reply@proxze.com",
      subject: "Verify Your Email",
      text: `Please click on the following link to verify your email: ${process.env.NETLIFY_URL}/verify-email/${encodedToken}`,
      html: `<p>Please click on the following link to verify your email: <a href="${process.env.NETLIFY_URL}/verify-email/${encodedToken}">${process.env.NETLIFY_URL}/verify-email/${verificationToken}</a></p>`,
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

    transporter.sendMail(msg);

    return res.status(201).json({
      status: true,
      message: "User created successfully",
      data: result,
    });
  } catch (err) {
    return res.status(500).json({
      status: true,
      message: `Unable to create user. Please try again. \n Error: ${err}`,
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
      bank: user.userBank,
      rating: getAverageRating(user.reviews),
      accountNumber: user.accountNumber && hideChars(user.accountNumber),
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
  const { oldAccountNumber, newAccountNumber, bank } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (user.accountNumber && oldAccountNumber !== user.accountNumber) {
      return res.status(401).json({
        status: false,
        message: "Incorrect old account number.",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { accountNumber: newAccountNumber, userBank: bank },
      { new: true }
    );

    const userData = {
      bank: updatedUser.userBank,
      accountNumber: hideChars(updatedUser.accountNumber),
    };
    res.status(200).send(userData);
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Server error",
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
  console.log(req.body);
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
      message: `Unable to get earnings. Please try again. \n Error: ${err}`,
    });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await User.find();

    return res.status(201).json({
      status: true,
      message: "Users fetched",
      data: users,
    });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: `Unable to get users. Please try again. \n Error: ${err}`,
    });
  }
};

module.exports = {
  createUser,
  verifyEmail,
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
