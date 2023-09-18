const User = require("../models/user");
const Task = require("../models/task");
const Organization = require("../models/organization");
const Transaction = require("../models/transaction");
const BulkTask = require("../models/bulkTask");
const Tasks = require("../controllers/tasks");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const {
  hideChars,
  getAverageRating,
  sortDataByDate,
} = require("../utils/helpers");
const { taskCreator } = require("../utils/tasks");
const { sendPushNotification } = require("../utils/pushNotifications");
dotenv.config();

const createOrg = async (req, res) => {
  try {
    const { name, certificateOfIncorporation, taxIdentificationNumber } =
      req.body;

    if (!name || !certificateOfIncorporation || !taxIdentificationNumber) {
      return res.status(400).json({
        status: false,
        message: "Fill in your organizations details",
      });
    }

    const organizationExists = await Organization.findOne({
      taxIdentificationNumber,
    });

    if (organizationExists) {
      return res.status(409).json({
        status: false,
        message: "Organization already exists with tax identification number",
      });
    }

    const organization = await Organization.create({
      name,
      certificateOfIncorporation,
      taxIdentificationNumber,
      owner: req.user.id,
      members: [{ user: req.user.id, role: "Supervisor" }],
    });

    return res.status(201).json({
      status: true,
      message: "Organization created successfully",
      data: organization,
    });
  } catch (err) {
    return res.status(500).json({
      status: true,
      message: `Unable to create organization. Please try again. \n Error: ${err}`,
    });
  }
};

const getOrg = async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id);

    return res.status(201).json({
      status: true,
      message: "Organization fetched successfully",
      data: organization,
    });
  } catch (err) {
    return res.status(500).json({
      status: true,
      message: `Unable to get organization. Please try again. \n Error: ${err}`,
    });
  }
};

const getOrgs = async (req, res) => {
  try {
    const organizations = await Organization.find({
      "members.user": req.user.id,
    });

    return res.status(201).json({
      status: true,
      message: "Organizations fetched successfully",
      data: organizations,
    });
  } catch (err) {
    return res.status(500).json({
      status: true,
      message: `Unable to get organizations. Please try again. \n Error: ${err}`,
    });
  }
};

const createBulkJob = async (req, res) => {
  try {
    const { bill, data } = req.body;

    const bulkTask = await BulkTask.create({
      organization: req.params.id,
      bill,
      data,
    });

    return res.status(201).json({
      status: true,
      message: "Bulk task created successfully",
      return: bulkTask,
    });
  } catch (err) {
    return res.status(500).json({
      status: true,
      message: `Unable to create bulk tasks. Please try again. \n Error: ${err}`,
    });
  }
};

const acceptBulkJob = async (req, res) => {
  try {
    const job = await BulkTask.findById(req.params.jobId).populate({
      path: "organization",
    });
    console.log(job);
    const createdTasks = [];

    for (const obj of job.data) {
      const newTask = await taskCreator({
        ...obj,
        type: "Verification",
        user: job.organization,
        principal: job.organization._id,
      });
      createdTasks.push(newTask._id);
    }

    job.tasks = createdTasks;
    await job.save();

    return res.status(201).json({
      status: true,
      message: "Bulk task created successfully",
      return: job,
    });
  } catch (err) {
    return res.status(500).json({
      status: true,
      message: `Unable to create bulk tasks. Please try again. \n Error: ${err}`,
    });
  }
};

const getBulkJob = async (req, res) => {
  try {
    const job = await BulkJob.findById(req.params.jobId);

    return res.status(201).json({
      status: true,
      message: "Job fetched successfully",
      data: job,
    });
  } catch (err) {
    return res.status(500).json({
      status: true,
      message: `Unable to get job. Please try again. \n Error: ${err}`,
    });
  }
};

const getAllBulkJobs = async (req, res) => {
  try {
    const jobs = await BulkJob.find({ organization: req.params.id });

    return res.status(201).json({
      status: true,
      message: "Jobs fetched successfully",
      data: jobs,
    });
  } catch (err) {
    return res.status(500).json({
      status: true,
      message: `Unable to get jobs. Please try again. \n Error: ${err}`,
    });
  }
};

const removeBulkJob = async (req, res) => {
  try {
    await BulkJob.findOneAndDelete({ _id: req.params.jobId });

    return res.status(201).json({
      status: true,
      message: "Job deleted successfully",
    });
  } catch (err) {
    return res.status(500).json({
      status: true,
      message: `Unable to get job. Please try again. \n Error: ${err}`,
    });
  }
};

module.exports = {
  createOrg,
  getOrg,
  getOrgs,
  getBulkJob,
  getAllBulkJobs,
  createBulkJob,
  acceptBulkJob,
  removeBulkJob,
};
