const mongoose = require("mongoose");
const Notification = require("../models/notification");
const User = require("../models/user");
const HelpDoc = require("../models/helpDoc");
const HelpTopic = require("../models/helpTopic");
const QuestionTopic = require("../models/questionTopic");
const HelpOption = require("../models/helpOption");

const createQuestionTopic = async (req, res) => {
  try {
    const { title, icon } = req.body;

    const existingTopic = await HelpTopic.findOne({
      title,
    });

    if (existingTopic) {
      return res.status(400).json({
        status: false,
        message: "Topic already exists",
      });
    }

    await QuestionTopic.create({ title, icon, author: req.user.id });

    return res.status(201).json({
      status: true,
      message: "Question topic created successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: false,
      message: `Unable to create question topic. Please try again. \n Error: ${error}`,
    });
  }
};

const createHelpOption = async (req, res) => {
  try {
    const { title, isSolution, parentId } = req.body;
    const { topicId } = req.params;

    const newOption = await HelpOption.create({
      title,
      isSolution,
      author: req.user.id,
    });

    if (parentId) {
      await HelpOption.findByIdAndUpdate(parentId, {
        $push: { subOptions: newOption._id },
      });
    } else {
      await QuestionTopic.findByIdAndUpdate(topicId, {
        $push: { options: newOption._id },
      });
    }

    return res.status(201).json({
      status: true,
      message: "Help option created successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: `Unable to create help option. Please try again. \n Error: ${error}`,
    });
  }
};

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

    await HelpTopic.create({ title, author: req.user.id });

    return res.status(201).json({
      status: true,
      message: "Topic created successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: false,
      message: `Unable to create help topic. Please try again. \n Error: ${error}`,
    });
  }
};

const getQuestionTopics = async (req, res) => {
  try {
    const topics = await QuestionTopic.find().populate({
      path: "options",
      select: "_id title",
    });

    return res.status(201).json({
      status: true,
      message: "Question topics fetched successfully",
      data: topics,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: `Unable to get question topics. Please try again. \n Error: ${error}`,
    });
  }
};

const getHelpOptions = async (req, res) => {
  try {
    const options = await HelpOption.find().populate({
      path: "subOptions",
      select: "_id title",
    });

    return res.status(201).json({
      status: true,
      message: "Help options fetched successfully",
      data: options,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: `Unable to get help options. Please try again. \n Error: ${error}`,
    });
  }
};

const getTopics = async (req, res) => {
  try {
    const topics = await HelpTopic.find();

    return res.status(201).json({
      status: true,
      message: "Topics fetched successfully",
      data: topics,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: `Unable to get topics. Please try again. \n Error: ${error}`,
    });
  }
};

const createDoc = async (req, res) => {
  try {
    const { title, topic, viewers, content } = req.body;

    const existingDoc = await HelpDoc.findOne({
      title,
    });

    if (existingDoc) {
      return res.status(400).json({
        status: false,
        message: "Document already exists with this title",
      });
    }

    const newDoc = await HelpDoc.create({
      title,
      topic,
      viewers,
      content,
      author: req.user.id,
    });

    await HelpTopic.findByIdAndUpdate(topic, {
      $push: { docs: newDoc._id },
    });

    return res.status(201).json({
      status: true,
      message: "Document created successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: `Unable to create help document. Please try again. \n Error: ${error}`,
    });
  }
};

const getDocs = async (req, res) => {
  try {
    const docs = await HelpDoc.find();

    return res.status(201).json({
      status: true,
      message: "Docs fetched successfully",
      data: docs,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: `Unable to get docs. Please try again. \n Error: ${error}`,
    });
  }
};

module.exports = {
  createTopic,
  createDoc,
  createQuestionTopic,
  createHelpOption,
  getTopics,
  getDocs,
  getQuestionTopics,
  getHelpOptions,
};
