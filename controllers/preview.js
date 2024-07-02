const dotenv = require("dotenv");
const Task = require("../models/task");
const User = require("../models/user");
const Review = require("../models/review");
const Notification = require("../models/notification");
const Stream = require("../models/stream");
const { getAverageRating } = require("../utils/helpers");
const {
  createTaskObject,
  createTaskpoolObject,
  createTaskListObject,
} = require("../utils/tasks");
const { taskCreator } = require("../utils/tasks");
const { sendPushNotification } = require("../utils/pushNotifications");
const { Expo } = require("expo-server-sdk");
const axios = require("axios");
const mongoose = require("mongoose");
dotenv.config();

const previewTask = async (req, res) => {
  const { taskId } = req.params;

  try {
    const task = await Task.findById(taskId)
      .populate("principal")
      .populate("proxze")
      .populate({
        path: "proxze",
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
      });

    return res.status(201).json(task);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
};

module.exports = {
  previewTask,
};
