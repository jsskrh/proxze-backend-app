const mongoose = require("mongoose");
const BillingAlgorithm = require("../models/billingAlgorithm");
const Task = require("../models/task");
const User = require("../models/user");
const Transaction = require("../models/transaction");
const { creditAccount, debitAccount } = require("../utils/transactions");
const { sortDataByDate } = require("../utils/helpers");
const System = require("../models/system");

const getTransactions = async (req, res) => {
  try {
    const userId = req.user.id;

    const transactions = await Transaction.find({ user: userId }).sort({
      createdAt: -1,
    });

    return res.status(201).json({
      status: true,
      message: "All transactions fetched",
      data: transactions,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: false,
      message: `Server error \n ${error}`,
    });
  }
};

const transfer = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { timestamp } = req.body;
    const { taskId } = req.params;
    const task = await Task.findById(taskId);
    const system = await System.findOne();
    const paymentRatio = system.paymentPercentage / 100;
    const beneficiary = task.proxze;
    // const principalId = task.principal;

    const reference =
      Date.now().toString(36) +
      Math.floor(
        Math.pow(10, 12) + Math.random() * 9 * Math.pow(10, 12)
      ).toString(36);

    // const benefactor = principalId;
    // const beneficiary = proxzeId;

    if (!beneficiary || !task.bill) {
      return res.status(400).json({
        status: false,
        message: "Please provide the following details: beneficiary, amount",
      });
    }

    const summary = `Transfer of ${
      task.bill * paymentRatio
    } for task #${taskId}`;

    const transferResult = await Promise.all([
      debitAccount({
        amount: task.bill * paymentRatio,
        // userId:beneficiary,
        taskId,
        purpose: "transfer",
        reference,
        summary,
        transactionSummary: `TRANSFER TO: ${beneficiary}. FOR: ${taskId}. TRANSACTION REF:${reference} `,
        session,
      }),
      creditAccount({
        amount: task.bill * paymentRatio,
        userId: beneficiary,
        taskId,
        purpose: "transfer",
        reference,
        summary,
        timestamp,
        transactionSummary: `TRANSFER FROM: Proxze App. FOR: ${taskId}. TRANSACTION REF:${reference} `,
        session,
      }),
    ]);

    const failedTransactions = transferResult.filter(
      (result) => result.status !== true
    );
    if (failedTransactions.length) {
      const errors = failedTransactions.map((a) => a.message);
      await session.abortTransaction();
      return res.status(400).json({
        status: false,
        message: errors,
      });
    }

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      status: true,
      message: "Transfer successful",
      data: transferResult[1].data,
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    console.error("Transfer Error:", err);

    return res.status(500).json({
      status: false,
      message: `Unable to perform transfer. Please try again.`,
      error: err,
    });
  }
};

const deposit = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { taskId } = req.params;

    const task = await Task.findById(taskId);

    const reference =
      Date.now().toString(36) +
      Math.floor(
        Math.pow(10, 12) + Math.random() * 9 * Math.pow(10, 12)
      ).toString(36);

    const userId = req.user.id;
    const summary = `Payment of ${task.bill} for task #${taskId}`;

    if (!task) {
      return res.status(400).json({
        status: false,
        message: "Task does not exist",
      });
    }

    const depositResult = await Promise.all([
      creditAccount({
        amount: task.bill,
        userId,
        taskId,
        purpose: "deposit",
        reference,
        summary,
        transactionSummary: `DEPOSIT FROM: ${userId}. FOR: ${taskId}. TRANSACTION REF:${reference} `,
        session,
      }),
    ]);

    const failedTransactions = depositResult.filter(
      (result) => result.status !== true
    );
    if (failedTransactions.length) {
      const errors = failedTransactions.map((a) => a.message);
      await session.abortTransaction();
      return res.status(400).json({
        status: false,
        message: errors,
      });
    }

    await session.commitTransaction();
    session.endSession();
    return res.status(201).json({
      status: true,
      message: "Deposit successful",
      data: depositResult[0].data,
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    return res.status(500).json({
      status: false,
      message: `Unable to deposit funds. Please try again.`,
      error: err,
    });
  }
};

const withdraw = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { amount } = req.body;

    const reference =
      Date.now().toString(36) +
      Math.floor(
        Math.pow(10, 12) + Math.random() * 9 * Math.pow(10, 12)
      ).toString(36);

    const userId = req.user.id;

    const summary = `Withdrawal of ${amount}`;

    if (!amount) {
      return res.status(400).json({
        status: false,
        message: "Please provide the following details: amount",
      });
    }

    const withdrawalResult = await Promise.all([
      debitAccount({
        amount,
        userId,
        purpose: "withdrawal",
        reference,
        summary,
        transactionSummary: `WITHDRAW FROM: ${userId}. TRANSACTION REF:${reference} `,
        session,
      }),
    ]);

    const failedTransactions = withdrawalResult.filter(
      (result) => result.status !== true
    );

    if (failedTransactions.length) {
      const errors = failedTransactions.map((a) => a.message);
      await session.abortTransaction();
      return res.status(400).json({
        status: false,
        message: errors,
      });
    }

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      status: true,
      message: "Withdrawal successful",
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    return res.status(500).json({
      status: false,
      message: `Unable to withdraw funds. Please try again.`,
      error: err,
    });
  }
};

const getEarnings = async (req, res) => {
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

    // Step 1: Find all transactions for the user
    const user = await User.findById(req.user.id);
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
    const currentMonthTransactions = userTransactions.filter((transaction) => {
      const transactionDate = new Date(transaction.createdAt);
      return (
        transactionDate.getFullYear() === currentYear &&
        transactionDate.getMonth() === currentMonth - 1
      );
    });
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

    // Create the result object
    const result = {
      balance: parseFloat(user.balance.toString()),
      monthlyEarnings: sortDataByDate(monthlyEarnings),
      currentMonthTotal,
      percentageChange,
      totalEarnings,
      recentTransactions,
    };

    return res.status(201).json({
      status: true,
      message: "Earnings fetched",
      data: result,
    });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: `Unable to get earnings. Please try again.`,
      error: err,
    });
  }
};

module.exports = { transfer, deposit, withdraw, getTransactions, getEarnings };
