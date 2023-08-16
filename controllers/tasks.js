const dotenv = require("dotenv");
const Task = require("../models/task");
const User = require("../models/user");
const Review = require("../models/review");
const Message = require("../models/message");
const Stream = require("../models/stream");
const { getAverageRating } = require("../utils/helpers");
const {
  createTaskObject,
  createTaskpoolObject,
  createTaskListObject,
} = require("../utils/tasks");
const { sendPushNotification } = require("../utils/pushNotifications");
const { Expo } = require("expo-server-sdk");
const axios = require("axios");
dotenv.config();

const createTask = async (req, res) => {
  try {
    const {
      type,
      description,
      bill,
      // educationLevel,
      // lga,
      // address,
      location,
      // state,
      // occupation,
      // searchRange,
      // isCertified,
      // skillLevel,
      // timeBlock,
      // yearsOfExperience,
      startDate,
      endDate,
    } = req.body;

    const principal = req.user.id;
    const user = await User.findById(req.user.id).populate({ path: "reviews" });

    const newTask = await Task.create({
      type,
      description,
      bill,
      // educationLevel,
      // lga,
      // address,
      location,
      // state,
      // occupation,
      // searchRange,
      // isCertified,
      // skillLevel,
      // timeBlock,
      // yearsOfExperience,
      startDate,
      endDate,
      principal,
      rating: getAverageRating(user.reviews),
      timeline: [{ status: "created", timestamp: Date.now() }],
    });

    const usersWithinRadius = await User.find({
      userType: "proxze", // Replace with the actual userType value
      location: {
        $geoWithin: {
          $centerSphere: [[location.coords.lng, location.coords.lat], 5 / 6371], // 5km radius in radians
        },
      },
      token: { $exists: true, $not: { $size: 0 } }, // Non-empty token array
    });

    console.log(usersWithinRadius);

    const expo = new Expo();
    const notifications = [];

    for (const user of usersWithinRadius) {
      for (const token of user.token) {
        notifications.push({
          to: token,
          sound: "default",
          body: "New task available!",
          data: { taskId: newTask._id },
        });
      }
    }

    const chunks = expo.chunkPushNotifications(notifications);

    for (const chunk of chunks) {
      try {
        await expo.sendPushNotificationsAsync(chunk);
      } catch (error) {
        console.error(error);
      }
    }

    // if (Expo.isExpoPushToken(expoPushToken)) {
    //   await sendPushNotification(expoPushToken, message);
    // }
    return res.status(201).json({
      status: true,
      message: "Task created successfully",
      data: newTask,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
};

const getPendingRequests = async (req, res) => {
  try {
    const pendingRequests = await Task.find({
      $expr: {
        $and: [
          { $eq: [{ $size: "$timeline" }, 1] },
          { $eq: [{ $arrayElemAt: ["$timeline.status", 0] }, "created"] },
        ],
      },
    }).sort({
      createdAt: -1,
    });

    const mappedRequests = pendingRequests.map((request) => {
      return createTaskpoolObject(request);
    });

    return res.status(201).json({
      status: true,
      message: "Pending requests fetched",
      data: mappedRequests,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
};

const getTask = async (req, res) => {
  const taskId = req.params.taskId;
  try {
    const task = await Task.findById(taskId)
      .populate("principal")
      .populate("proxzi")
      .populate({
        path: "proxzi",
        populate: {
          path: "reviews",
          model: "Review",
        },
      })
      .populate({
        path: "principal",
        populate: {
          path: "reviews",
          model: "Review",
        },
      })
      .populate("offers.proxzi");
    //.populate("attachments");
    // .populate("offers.proxzi.reviews");

    var stream = {};
    await axios
      .get(`http://localhost:8000/api/streams/live/${taskId}`)
      .then(async (response) => {
        stream = await response.data;
        return;
      })
      .catch((err) => {
        console.log(err);
        return err;
      });

    return res.status(201).json({
      status: true,
      message: "Task fetched",
      data: createTaskObject(task, stream),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
};

const updateLastViewed = async (req, res) => {
  try {
    await Task.findByIdAndUpdate(req.params.taskId, { lastViewed: Date.now() });

    return res.status(201).json({
      status: true,
      message: "Last viewed updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
};

const approveRejectRequest = async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.taskId,
      {
        $push: { timeline: { status: req.params.type, timestamp: Date.now() } },
      },
      { new: true }
    )
      .populate("principal")
      // .populate("principal.reviews")
      .populate("offers.proxzi");
    //.populate("attachments");
    // .populate("offers.proxzi.reviews");

    const newNotification = await Message.create({
      type: req.params.type === "approved" ? "approve" : "reject",
      recipient: task.principal._id,
      task: task._id,
    });

    await User.findByIdAndUpdate(task.principal._id, {
      $push: { notifications: newNotification._id },
    });

    return res.status(201).json({
      status: true,
      message: `Task has been ${req.params.type} successfully`,
      data: createTaskObject(task),
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
};

const getTaskpool = async (req, res) => {
  try {
    const tasks = await Task.find({
      "timeline.status": "approved",
      paymentStatus: true,
      proxzi: { $exists: false },
    }).sort({
      createdAt: -1,
    });
    // console.log(tasks);
    const mappedTasks = tasks.map((task) => {
      return createTaskpoolObject(task);
    });

    return res.status(201).json({
      status: true,
      message: "Taskpool fetched",
      data: mappedTasks,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
};

const makeOffer = async (req, res) => {
  const { coverLetter, timestamp } = req.body;

  if (!coverLetter || !timestamp) {
    return res.status(401).json({
      status: false,
      message: "No cover letter present",
    });
  }

  try {
    const task = await Task.findById(req.params.taskId);

    if (!task) {
      return res.status(404).json({
        status: false,
        message: "Task not found",
      });
    }

    const existingOffer = task.offers.find(
      (offer) => offer.proxzi.toString() === req.user.id
    );

    if (existingOffer) {
      return res.status(400).json({
        status: false,
        message: "You have already made an offer",
      });
    }

    task.offers.push({ proxzi: req.user.id, coverLetter, timestamp });
    await task.save();

    const populatedTask = await Task.findById(task._id)
      .populate("principal")
      .populate("principal.reviews")
      .populate("offers.proxzi");
    //.populate("attachments");
    // .populate("offers.proxzi.reviews");

    const newNotification = await Message.create({
      type: "offer",
      recipient: task.principal._id,
      sender: req.user.id,
      task: task._id,
    });

    await User.findByIdAndUpdate(task.principal._id, {
      $push: { notifications: newNotification._id },
    });

    return res.status(201).json({
      status: true,
      message: `Offer has been made`,
      data: createTaskObject(populatedTask),
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
};

const acceptOffer = async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.taskId, proxzi: { $exists: false } },
      {
        proxzi: req.body.proxzi,
        $push: {
          timeline: {
            status: "assigned",
            timestamp: req.body.timestamp,
          },
        },
      },
      { new: true }
    )
      .populate("principal")
      .populate("proxzi")
      .populate("principal.reviews")
      .populate("offers.proxzi");
    //.populate("attachments");
    // .populate("offers.proxzi.reviews");

    if (!task) {
      return res.status(404).json({
        status: false,
        message: "Task has already been assigned",
      });
    }

    const newNotification = await Message.create({
      type: "assign",
      recipient: task.proxzi._id,
      sender: task.principal._id,
      task: task._id,
    });

    await User.findByIdAndUpdate(task.proxzi._id, {
      $push: { notifications: newNotification._id },
    });

    return res.status(201).json({
      status: true,
      message: `Proxzi has been assigned`,
      data: createTaskObject(task),
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
};

const startTask = async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      {
        _id: req.params.taskId,
        proxzi: { $exists: true },
      },
      {
        $push: {
          timeline: {
            status: "started",
            timestamp: req.body.timestamp,
          },
        },
      },
      { new: true }
    )
      .populate("principal")
      .populate("proxzi")
      .populate("principal.reviews")
      .populate("offers.proxzi");
    //.populate("attachments");
    // .populate("offers.proxzi.reviews");

    if (!task) {
      return res.status(404).json({
        status: false,
        message: "Task not yet assigned",
      });
    }

    const newPrincipalNotification = await Message.create({
      type: "start",
      recipient: task.principal._id,
      task: task._id,
    });

    const newProxziNotification = await Message.create({
      type: "start",
      recipient: task.proxzi._id,
      task: task._id,
    });

    await User.findByIdAndUpdate(task.principal._id, {
      $push: { notifications: newPrincipalNotification._id },
    });

    await User.findByIdAndUpdate(task.proxzi._id, {
      $push: { notifications: newProxziNotification._id },
    });

    return res.status(201).json({
      status: true,
      message: `Task has started`,
      data: createTaskObject(task),
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
};

const uploadAttachment = async (req, res) => {
  const { url, duration, size, timestamp } = req.body;
  try {
    const task = await Task.findOneAndUpdate(
      {
        _id: req.params.taskId,
        "timeline.status": "started",
      },
      {
        $push: {
          attachments: {
            url,
            timestamp,
            size,
            duration,
          },
        },
      },
      { new: true }
    )
      .populate("principal")
      .populate("proxzi")
      .populate("principal.reviews")
      .populate("offers.proxzi");
    //.populate("attachments");
    // .populate("offers.proxzi.reviews");

    if (!task) {
      return res.status(404).json({
        status: false,
        message: "Task not yet started",
      });
    }

    return res.status(201).json({
      status: true,
      message: `File has been saved`,
      data: createTaskObject(task),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
};

const completeTask = async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      {
        _id: req.params.taskId,
        "timeline.status": "started",
        // attachments: { $exists: true, $ne: [] },
      },
      {
        $push: {
          timeline: {
            status: "completed",
            timestamp: req.body.timestamp,
          },
        },
      },
      { new: true }
    )
      .populate("principal")
      .populate("proxzi")
      .populate("principal.reviews")
      .populate("offers.proxzi");
    //.populate("attachments");
    // .populate("offers.proxzi.reviews");

    if (!task) {
      return res.status(404).json({
        status: false,
        message: "Task attachments have not been uploaded",
      });
    }

    const newNotification = await Message.create({
      type: "complete",
      recipient: task.principal._id,
      sender: task.proxzi._id,
      task: task._id,
    });

    await User.findByIdAndUpdate(task.principal._id, {
      $push: { notifications: newNotification._id },
    });

    return res.status(201).json({
      status: true,
      message: `Task has been completed`,
      data: createTaskObject(task),
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
};

const confirmTask = async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      {
        _id: req.params.taskId,
        "timeline.status": "completed",
      },
      {
        $push: {
          timeline: {
            status: "confirmed",
            timestamp: req.body.timestamp,
          },
        },
      },
      { new: true }
    )
      .populate("principal")
      .populate("proxzi")
      .populate("principal.reviews")
      .populate("offers.proxzi");
    //.populate("attachments");
    // .populate("offers.proxzi.reviews");

    if (!task) {
      return res.status(404).json({
        status: false,
        message: "Task has not yet been completed",
      });
    }

    const newNotification = await Message.create({
      type: "confirm",
      recipient: task.proxzi._id,
      sender: task.principal._id,
      task: task._id,
    });

    await User.findByIdAndUpdate(task.proxzi._id, {
      $push: { notifications: newNotification._id },
    });

    return res.status(201).json({
      status: true,
      message: `Task has been confirmed`,
      data: createTaskObject(task),
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
};

const getOngoingTasks = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    let tasks = [];

    if (user.userType === "proxzi") {
      tasks = await Task.find({
        proxzi: user._id,
        "timeline.status": { $nin: ["rejected", "confirmed"] },
      })
        .populate("principal")
        .populate("proxzi");
    } else if (user.userType === "principal") {
      tasks = await Task.find({
        principal: user._id,
        "timeline.status": { $nin: ["rejected", "confirmed"] },
      })
        .populate("principal")
        .populate("proxzi");
    } else {
      tasks = await Task.find({
        "timeline.status": { $nin: ["rejected", "confirmed"] },
      })
        .populate("principal")
        .populate("proxzi");
    }

    const mappedTasks = tasks.map((task) => {
      return createTaskListObject(task);
    });

    return res.status(201).json({
      status: true,
      message: "Pending requests fetched",
      data: mappedTasks,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
};

const getTaskHistory = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    let tasks = [];

    if (user.userType === "proxzi") {
      tasks = await Task.find({
        proxzi: user._id,
        timeline: {
          $elemMatch: {
            status: { $in: ["rejected", "confirmed"] },
          },
        },
      })
        .populate("principal")
        .populate("proxzi");
    } else if (user.userType === "principal") {
      tasks = await Task.find({
        principal: user._id,
        timeline: {
          $elemMatch: {
            status: { $in: ["rejected", "confirmed"] },
          },
        },
      })
        .populate("principal")
        .populate("proxzi");
    } else {
      tasks = await Task.find({
        timeline: {
          $elemMatch: {
            status: { $in: ["rejected", "confirmed"] },
          },
        },
      })
        .populate("principal")
        .populate("proxzi");
    }

    const mappedTasks = tasks.map((task) => {
      return createTaskListObject(task);
    });

    return res.status(201).json({
      status: true,
      message: "Pending requests fetched",
      data: mappedTasks,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
};

const handleLive = async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      {
        _id: req.params.taskId,
        proxzi: { $exists: true },
      },
      {
        live: req.body.type,
      },
      { new: true }
    )
      .populate("principal")
      .populate("proxzi")
      .populate("principal.reviews")
      .populate("offers.proxzi");
    //.populate("attachments");
    // .populate("offers.proxzi.reviews");

    if (!task) {
      return res.status(404).json({
        status: false,
        message: "Task not yet assigned",
      });
    }

    // const newPrincipalNotification = await Message.create({
    //   type: "live",
    //   recipient: task.principal._id,
    //   task: task._id,
    // });

    // await User.findByIdAndUpdate(task.principal._id, {
    //   $push: { notifications: newPrincipalNotification._id },
    // });

    return res.status(201).json({
      status: true,
      message: `Task updated`,
      data: createAssignedTaskObject(task),
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
};

module.exports = {
  createTask,
  getTask,
  getPendingRequests,
  updateLastViewed,
  approveRejectRequest,
  getTaskpool,
  makeOffer,
  acceptOffer,
  startTask,
  uploadAttachment,
  completeTask,
  confirmTask,
  getOngoingTasks,
  getTaskHistory,
  handleLive,
};
