const User = require("../models/user");
const Transaction = require("../models/transaction");
const System = require("../models/system");
const Task = require("../models/task");
const { createTaskObject } = require("./tasks");
const Message = require("../models/message");

const creditAccount = async ({
  amount,
  userId,
  taskId,
  purpose,
  reference,
  summary,
  transactionSummary,
  session,
  timestamp,
}) => {
  let user;

  if (purpose === "deposit") {
    user = await System.findOne().session(session);
  } else if (purpose === "transfer") {
    user = await User.findById(userId).session(session);
  }

  if (!user) {
    return {
      status: false,
      statusCode: 404,
      message: `User doesn\'t exist`,
    };
  }

  await user.updateOne({ $inc: { balance: amount } }, { session });

  // let updatedUser;

  // if (purpose === "deposit") {
  //   const updatedSystem = await User.findByIdAndUpdate(
  //     "6427dcf5e7e46b77b43bb882",
  //     { $inc: { balance: amount } },
  //     { session }
  //   );
  // } else if (purpose === "transfer") {
  //   updatedUser = await User.findById(
  //     { userId },
  //     { $inc: { balance: amount } },
  //     { session }
  //   );
  // }

  const transaction = await Transaction.create(
    [
      {
        transactionType: "CR",
        purpose,
        amount,
        task: taskId,
        user: userId,
        reference,
        balanceBefore: Number(user.balance),
        balanceAfter: Number(user.balance) + Number(amount),
        summary,
        transactionSummary,
      },
    ],
    { session }
  );

  let task;

  if (purpose === "deposit") {
    task = await Task.findByIdAndUpdate(
      taskId,
      {
        paymentStatus: true,
        $push: { timeline: { status: "approved", timestamp: Date.now() } },
      },
      { new: true }
    )
      .populate("principal")
      .populate("proxze")
      // .populate("principal.reviews")
      .populate("offers.proxze")
      .session(session);
    // .populate("offers.proxze.reviews");
  } else if (purpose === "transfer") {
    task = await Task.findOneAndUpdate(
      {
        _id: taskId,
        "timeline.status": "completed",
      },
      {
        $push: {
          timeline: {
            status: "confirmed",
            timestamp: timestamp,
          },
        },
      },
      { new: true }
    )
      .populate("principal")
      .populate("proxze")
      // .populate("principal.reviews")
      .populate("offers.proxze")
      .session(session);
    // .populate("offers.proxze.reviews");

    if (!task) {
      return res.status(404).json({
        status: false,
        message: "Task has not yet been completed",
      });
    }

    const confirmNotification = await Message.create(
      [
        {
          type: "confirm",
          recipient: task.proxze._id,
          sender: task.principal._id,
          task: task._id,
        },
      ],
      { session }
    );

    const creditNotification = await Message.create(
      [
        {
          type: "credit",
          recipient: task.proxze._id,
          sender: task.principal._id,
          task: task._id,
          amount,
        },
      ],
      { session }
    );

    const notificationsToPush = [
      confirmNotification._id,
      creditNotification._id,
    ];

    await User.findByIdAndUpdate(task.proxze._id, {
      $push: { notifications: { $each: notificationsToPush } },
    }).session(session);
  }

  console.log(`Credit successful`);

  return {
    status: true,
    statusCode: 201,
    message: "Credit successful",
    // data: { updatedUser, transaction },
    data: createTaskObject(task),
  };
};

const debitAccount = async ({
  amount,
  userId,
  taskId,
  purpose,
  reference,
  summary,
  transactionSummary,
  session,
}) => {
  // const user = await User.findOne({ username });

  let user;

  if (purpose === "transfer") {
    user = await System.findOne().session(session);
  } else if (purpose === "withdrawal") {
    user = await User.findById(userId).session(session);
  }

  if (!user) {
    return {
      status: false,
      statusCode: 404,
      message: `User doesn\'t exist`,
    };
  }

  if (Number(user.balance) < amount) {
    return {
      status: false,
      statusCode: 400,
      message: `User has insufficient balance`,
    };
  }

  await user.updateOne({ $inc: { balance: -amount } }).session(session);

  // const updatedUser = await User.findOneAndUpdate(
  //   { username },
  //   { $inc: { balance: -amount } },
  //   { session }
  // );

  let transactionObject = {
    transactionType: "DR",
    purpose,
    amount,
    reference,
    balanceBefore: Number(user.balance),
    balanceAfter: Number(user.balance) - Number(amount),
    summary,
    transactionSummary,
  };

  if (purpose === "transfer") {
    transactionObject.system = user._id;
  } else if (purpose === "withdrawal") {
    transactionObject.user = userId;
  }

  if (taskId) {
    transactionObject.task = taskId;
  }

  const transaction = await Transaction.create([transactionObject], {
    session,
  });

  console.log(`Debit successful`);
  return {
    status: true,
    statusCode: 201,
    message: "Debit successful",
    // data: { updatedUser, transaction },
  };
};

module.exports = {
  creditAccount,
  debitAccount,
};
