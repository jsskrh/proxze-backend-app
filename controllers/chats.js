const mongoose = require("mongoose");
const Chat = require("../models/chat");
const Message = require("../models/message");
const User = require("../models/user");
const Task = require("../models/task");
const { createChatObject } = require("../utils/chat");

const getAllChats = async (req, res) => {
  try {
    const chats = await Chat.find({ users: req.user.id })
      .populate({
        path: "users",
        select: "_id firstName lastName email avatar",
      })
      .populate("lastMessage")
      .sort({ updatedAt: -1 });

    // const mappedChats = chats.map((chat) => {
    //   return createChatObject(chat);
    // });

    return res.status(201).json({
      status: true,
      message: "All chats fetched",
      data: chats,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
};

const getUnseenChats = async (req, res) => {
  try {
    const count = await Chat.countDocuments({
      users: req.user.id,
      "messages.seen": false,
    }).exec();

    return res.status(201).json({
      status: true,
      message: "Unseen messages fetched",
      data: { count },
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
    const filter = { users: req.user.id };
    const update = { $set: { "messages.$.seen": true } };

    const result = await Chat.updateMany(filter, update);

    return res.status(201).json({
      status: true,
      message: "Chats seen",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
};

const createChat = async (req, res) => {
  try {
    const { proxze, message } = req.body;
    const { taskId } = req.params;
    console.log(proxze, message);
    const principal = req.user.id;

    const existingChat = await Chat.findOne({
      users: proxze,
      task: taskId,
    });

    if (existingChat) {
      return res.status(400).json({
        status: false,
        message: "Chat already exists",
      });
    }

    const newChat = await Chat.create({
      task: taskId,
      users: [proxze, req.user.id],
    });

    console.log(newChat);

    const newMessage = await Message.create({
      chat: newChat._id,
      content: message,
      sender: req.user.id,
    });

    newChat.lastMessage = newMessage._id;

    newChat.save();

    // Fetch the task by req.params.taskId
    const task = await Task.findById(req.params.taskId);

    // Find the offer object with the matching proxze value
    const offer = task.offers.find(
      (offer) => offer.proxze.toString() === proxze
    );

    // Add the chat ID to the found offer
    if (offer) {
      offer.chat = newChat._id;
      await task.save();
    }

    await newChat.populate({
      path: "users",
      select: "_id firstName lastName email avatar",
    });

    await newChat.populate("lastMessage");

    return res.status(201).json({
      status: true,
      message: "Chat created successfully",
      data: newChat,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { message } = req.body;

    const newMessage = await Message.create({
      chat: chatId,
      content: message,
      sender: req.user.id,
    });

    const filter = { _id: chatId };
    const update = {
      lastMessage: newMessage._id,
    };

    const updatedChat = await Chat.findOneAndUpdate(filter, update, {
      new: true,
    });

    await updatedChat.populate({
      path: "users",
      select: "_id firstName lastName email avatar",
    });
    await updatedChat.populate("lastMessage");

    return res.status(201).json({
      status: true,
      message: "Message sent successfully",
      data: newMessage,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
};

const getChat = async (req, res) => {
  try {
    const { chatId } = req.params;

    const messages = await Message.find({ chat: chatId });

    return res.status(201).json({
      status: true,
      message: "Chat fetched successfully",
      data: messages,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
};

const setToRead = async (req, res) => {
  const { chatId } = req.params;

  try {
    const filter = { _id: chatId, "messages.read": false };
    const update = { $set: { "messages.$[elem].read": true } };
    const options = { arrayFilters: [{ "elem.read": false }], multi: true };

    const updatedChat = await Chat.findOneAndUpdate(filter, update, options);

    return res.status(201).json({
      status: true,
      message: "Message read",
      data: updatedChat._id,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
};

const checkForExistingChat = async (req, res) => {
  const { proxze } = req.body;
  try {
    const chat = await Chat.findOne({
      users: { $all: [req.user.id, proxze] },
    });

    if (chat) {
      return res.status(201).json({
        status: true,
        message: "Chat exists",
        data: chat,
      });
    } else {
      return res.status(201).json({
        status: true,
        message: "Chat doesn't exist",
        data: false,
      });
    }
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
};

module.exports = {
  getAllChats,
  getUnseenChats,
  setToSeen,
  createChat,
  setToRead,
  sendMessage,
  checkForExistingChat,
  getChat,
};
