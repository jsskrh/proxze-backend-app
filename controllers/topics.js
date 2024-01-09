const mongoose = require("mongoose");
const Notification = require("../models/notification");
const User = require("../models/user");

const createTopic = async (req, res) => {
  try {
    const { title } = req.body;

    const existingTopic = await HelpTopic.findOne({
      title,
    });

    if (existingTopic) {
      return res.status(400).json({
        status: false,
        message: "Topic already exists",
      });
    }

    await HelpTopic.create({ title });

    const topics = await HelpTopic.find();

    return res.status(201).json({
      status: true,
      message: "Topic created successfully",
      data: topics,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
};

const getUnseenNotifications = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: "notifications",
      options: { sort: { createdAt: -1 } },
    });

    const notifications = user.notifications.slice(0, 3);
    const count = user.notifications.filter(
      (notification) => !notification.seen
    ).length;

    return res.status(201).json({
      status: true,
      message: "Unseen notifications fetched",
      data: { notifications, count },
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
};

const setToSeen = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, seen: false },
      { seen: true }
      // { arrayFilters: [{ "elem.seen": false }] }
    );

    return res.status(201).json({
      status: true,
      message: "Notifications seen",
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: `Server error \n ${error}`,
    });
  }
};

const setToRead = async (req, res) => {
  const { notificationId } = req.params;
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, recipient: req.user.id },
      { read: true }
    );

    return res.status(201).json({
      status: true,
      message: "Notification read",
      data: message._id,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
};

module.exports = {
  getAllNotifications,
  getUnseenNotifications,
  setToSeen,
  setToRead,
};
