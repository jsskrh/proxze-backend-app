const mongoose = require("mongoose");
const BillingAlgorithm = require("../models/billingAlgorithm");
const Task = require("../models/task");
const Transaction = require("../models/transaction");
const { creditAccount, debitAccount } = require("../utils/transactions");

const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id }).sort({
      createdBy: -1,
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
    const billingAlgorithm = await BillingAlgorithm.findOne();
    const paymentRatio = billingAlgorithm.paymentPercentage / 100;
    const beneficiary = task.proxzi;
    // const principalId = task.principal;

    const reference =
      Date.now().toString(36) +
      Math.floor(
        Math.pow(10, 12) + Math.random() * 9 * Math.pow(10, 12)
      ).toString(36);

    // const benefactor = principalId;
    // const beneficiary = proxziId;

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
        transactionSummary: `TRANSFER FROM: Proxzi App. FOR: ${taskId}. TRANSACTION REF:${reference} `,
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

    return res.status(500).json({
      status: false,
      message: `Unable to perform transfer. Please try again. \n Error: ${err}`,
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
      message: `Unable to deposit funds. Please try again. \n Error: ${err}`,
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
      message: `Unable to withdraw funds. Please try again. \n Error: ${err}`,
    });
  }
};

module.exports = { transfer, deposit, withdraw, getTransactions };
