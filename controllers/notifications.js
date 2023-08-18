const mongoose = require("mongoose");
const Notification = require("../models/notification");
const User = require("../models/user");

const getAllNotifications = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: "notifications",
      populate: {
        path: "task",
        model: "Task",
      },
      options: { sort: { createdAt: -1 } },
    });

    const notifications = user.notifications.map((notification) => {
      return {
        id: notification._id,
        type: notification.type,
        seen: notification.seen,
        read: notification.read,
        recipient: notification.recipient,
        sender: notification.sender,
        task: notification.task
          ? { id: notification.task._id, type: notification.task.type }
          : null,
        createdAt: notification.createdAt,
        ticket: notification.ticket,
        content: notification.content,
      };
    });
    return res.status(201).json({
      status: true,
      message: "All notifications fetched",
      data: notifications,
    });
  } catch (error) {
    console.log(error);
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
