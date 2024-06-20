const uuid = require("uuid");
const User = require("../models/user");
const Task = require("../models/task");
const Organization = require("../models/organization");
const Transaction = require("../models/transaction");
const BulkTask = require("../models/bulkTask");
const OrgReq = require("../models/orgReq");
const Tasks = require("../controllers/tasks");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const {
  hideChars,
  getAverageRating,
  sortDataByDate,
} = require("../utils/helpers");
const { taskCreator } = require("../utils/tasks");
const { sendPushNotification } = require("../utils/pushNotifications");
const { updateReqStatus } = require("../utils/stateMachines/orgReq");
dotenv.config();

const getOrgReqs = async (req, res) => {
  try {
    const { status } = req.query;
    const statuses = status.split(",");
    const userId = req.user.id;

    const requests = await OrgReq.find({
      $or: [
        {
          $and: [{ status: { $eq: "reviewing" } }, { accountManager: userId }],
        },
        { status: { $in: statuses } },
      ],
    }).populate({
      path: "initiator",
      select: "_id firstName lastName",
    });

    return res.status(201).json(requests);
  } catch (err) {
    return res.status(500).json({
      status: true,
      message: `Unable to get requests. Please try again.`,
      error: err,
    });
  }
};

const getOrgReq = async (req, res) => {
  try {
    const request = await OrgReq.findOne({
      initiator: req.user.id,
      status: { $nin: ["rejected", "approved"] },
    });
    const reqArr = [];

    if (request) {
      reqArr.push(request);
    }

    return res.status(201).json(reqArr);
  } catch (err) {
    return res.status(500).json({
      status: true,
      message: `Unable to get requests. Please try again.`,
      error: err,
    });
  }
};

const createOrgReq = async (req, res) => {
  try {
    const { name, rCNumber, email, phoneNumber, address } = req.body;

    if (!name || !rCNumber || !email || !phoneNumber || !address) {
      return res.status(400).json({
        status: false,
        message: "Fill in your organizations request details",
      });
    }

    const activeReq = await OrgReq.findOne({
      initiator: req.user.id,
      status: { $nin: ["rejected", "approved"] },
    });

    if (activeReq) {
      return res.status(400).json({
        status: false,
        message: "You can only make one request at a time.",
      });
    }

    orgExists = await Organization.findOne({
      $or: [{ email }, { phoneNumber }, { rCNumber }],
    });

    if (orgExists) {
      return res.status(400).json({
        status: false,
        message: "Organization already exists with matching details",
      });
    }

    const request = await OrgReq.create({
      name,
      rCNumber,
      email,
      phoneNumber,
      address,
      initiator: req.user.id,
    });

    return res.status(201).json({
      status: true,
      message: "Organization request created successfully",
      data: request,
    });
  } catch (err) {
    return res.status(500).json({
      status: true,
      message: `Unable to create request. Please try again.`,
      error: err,
    });
  }
};

const processOrgReq = async (req, res) => {
  try {
    const { reqId, event } = req.params;

    const request = await OrgReq.findById(reqId);
    const newStatus = updateReqStatus(event, request.status);
    request.status = newStatus;

    if (newStatus === "reviewing") {
      request.accountManager = req.user.id;
    } else if (newStatus === "approved") {
      await Organization.create({
        name: request.name,
        rCNumber: request.rCNumber,
        email: request.email,
        phoneNumber: request.phoneNumber,
        address: request.address,
        accountManager: request.accountManager,
        request: reqId,
        members: [
          { user: request.initiator, role: "supervisor" },
          { user: request.accountManager, role: "accountManager" },
        ],
      });
    }

    await request.save();

    return res.status(201).json({
      status: true,
      message: "Organization request processed successfully",
      data: request,
    });
  } catch (err) {
    return res.status(500).json({
      status: true,
      message: `Unable to create organization. Please try again.`,
      error: err,
    });
  }
};

const acceptMembership = async (req, res) => {
  try {
    const { password } = req.body;
    const { orgId } = req.params;

    if (!password) {
      return res.status(400).json({
        status: false,
        message: "Fill in your details",
      });
    }

    const user = await User.findById(req.user.id);

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const updatedOrg = await Organization.findOneAndUpdate(
      {
        _id: orgId,
        "members.user": req.user.id,
      },
      {
        $set: {
          "members.$.orgPass": hashedPassword,
          "members.$.status": "accepted",
        },
      },
      { new: true }
    );

    return res.status(201).json({
      status: true,
      message: "Accepted membership successfully",
    });
  } catch (err) {
    return res.status(500).json({
      status: true,
      message: `Unable to accept membership. Please try again.`,
      error: err,
    });
  }
};

const rejectMembership = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    const updatedOrg = await Organization.findOneAndUpdate(
      {
        _id: req.params.orgId,
        "members.email": user.email,
      },
      {
        $set: {
          "members.$.status": "rejected",
        },
      },
      { new: true }
    );

    return res.status(201).json({
      status: true,
      message: "Rejected membership successfully",
    });
  } catch (err) {
    return res.status(500).json({
      status: true,
      message: `Unable to reject membership. Please try again.`,
      error: err,
    });
  }
};

const orgLogin = async (req, res) => {
  try {
    if (!req.body.password) {
      return res.status(401).json({
        status: false,
        message: "Password required",
      });
    }

    const user = await User.findById(req.user.id);
    const org = await Organization.findById(req.params.orgId);

    if (!org) {
      return res.status(401).json({
        status: false,
        message: "Organization does not exist.",
      });
    }

    const orgUser = org.members.find((member) =>
      member.user.equals(req.user.id)
    );

    if (orgUser.status !== "accepted") {
      return res.status(401).json({
        status: false,
        message: "Not an accepted member of organization.",
      });
    }

    if (await bcrypt.compare(req.body.password, orgUser.orgPass)) {
      const orgToken = jwt.sign(
        { userId: user._id, orgId: org._id, role: orgUser.role },
        process.env.ENTERPRISE_ACCESS_TOKEN
      );

      return res.status(200).json({
        status: true,
        message: "Member logged in successfully",
        data: { orgToken },
      });
    } else {
      res.status(401).send("Invalid Credentials");
    }
  } catch (err) {
    return res.status(500).json({
      status: true,
      message: `Unable to login to organization. Please try again.`,
      error: err,
    });
  }
};

const addMember = async (req, res) => {
  try {
    const { email, role } = req.body;

    const member = await User.findOne({ email, userType: "principal" });

    if (!member) {
      return res.status(401).json({
        status: false,
        message:
          "Member could not be added. Memeber has to be a registered on Proxze with a principal account.",
      });
    }

    const user = await User.findById(req.user.userId);
    const org = await Organization.findById(req.user.orgId);

    if (!org) {
      return res.status(401).json({
        status: false,
        message: "Organization does not exist.",
      });
    }

    const isMember = org.members.find((orgMember) =>
      member._id.equals(orgMember.user)
    );

    if (isMember) {
      return res.status(400).json({
        status: true,
        message: `${user.firstName} ${user.lastName} is already a member.`,
      });
    }

    org.members.push({ user: member._id, role });

    await org.save();

    return res.status(201).json({
      status: true,
      message: "Member added successfully",
      data: org,
    });
  } catch (error) {
    return res.status(500).json({
      status: true,
      message: `Unable to loginto organization. Please try again.`,
      error: err,
    });
  }
};

const getOrg = async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.orgId).populate(
      {
        path: "members",
        populate: { path: "user", select: "_id firstName lastName email" },
      }
    );

    return res.status(201).json({
      status: true,
      message: "Organization fetched successfully",
      data: organization,
    });
  } catch (err) {
    return res.status(500).json({
      status: true,
      message: `Unable to get organization. Please try again.`,
      error: err,
    });
  }
};

const getOrgs = async (req, res) => {
  try {
    const organizations = await Organization.find({
      "members.user": req.user.id,
    });

    return res.status(201).json(organizations);
  } catch (err) {
    return res.status(500).json({
      status: true,
      message: `Unable to get organizations. Please try again.`,
      error: err,
    });
  }
};

const createBulkJob = async (req, res) => {
  try {
    const { data } = req.body;

    const bulkTask = await BulkTask.create({
      organization: req.params.orgId,
      createdBy: req.user.id,
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
      message: `Unable to create bulk tasks. Please try again.`,
      error: err,
    });
  }
};

const acceptBulkJob = async (req, res) => {
  try {
    const { rate } = req.body;

    const job = await BulkTask.findById(req.params.jobId).populate({
      path: "organization",
    });
    const createdTasks = [];
    let currentDate = new Date();
    let futureDate = new Date(currentDate);
    futureDate.setDate(currentDate.getDate() + 7);

    for (const obj of job.data) {
      const newTask = await taskCreator({
        startDate: currentDate,
        endDate: futureDate,
        location: obj.location,
        description: `Verify ${obj.name}, ${obj.gender}`,
        bill: rate,
        type: "Verification",
        user: job.organization,
        principal: job.createdBy,
        organization: job.organization._id,
        enterprise: true,
      });
      createdTasks.push(newTask._id);
    }
    job.bill = {
      rate,
      subtotal: rate * job.data.length,
      serviceFee: 2000,
      total: rate * job.data.length + 2000,
    };
    job.status = "approved";
    job.approvedBy = req.user.id;
    job.tasks = createdTasks;
    await job.save();

    return res.status(201).json({
      status: true,
      message: "Bulk task accepted successfully",
      return: job,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: true,
      message: `Unable to accept bulk tasks. Please try again.`,
      error: err,
    });
  }
};

const getBulkJob = async (req, res) => {
  try {
    const job = await BulkTask.findById(req.params.jobId)
      .populate({
        path: "createdBy",
        select: "_id firstName lastName email avatar",
      })
      .populate({
        path: "approvedBy",
        select: "_id firstName lastName email avatar",
      })
      .populate({
        path: "tasks",
        select: "_id timeline proxze bill",
        // populate: {
        //   path: "proxze",
        //   model: "User",
        //   select: "_id firstName lastName email avatar",
        // },
      })
      .populate({
        path: "tasks.proxze",
        select: "_id firstName lastName email avatar",
      });

    return res.status(201).json({
      status: true,
      message: "Job fetched successfully",
      data: job,
    });
  } catch (err) {
    return res.status(500).json({
      status: true,
      message: `Unable to get job. Please try again.`,
      error: err,
    });
  }
};

const getAllBulkJobs = async (req, res) => {
  try {
    const jobs = await BulkTask.find({
      organization: req.params.orgId,
    }).populate({
      path: "createdBy",
      select: "_id firstName lastName email avatar",
    });

    return res.status(201).json({
      status: true,
      message: "Jobs fetched successfully",
      data: jobs,
    });
  } catch (err) {
    return res.status(500).json({
      status: true,
      message: `Unable to get jobs. Please try again.`,
      error: err,
    });
  }
};

const removeBulkJob = async (req, res) => {
  try {
    await BulkTask.findOneAndDelete({ _id: req.params.jobId });

    return res.status(201).json({
      status: true,
      message: "Job deleted successfully",
    });
  } catch (err) {
    return res.status(500).json({
      status: true,
      message: `Unable to get job. Please try again.`,
      error: err,
    });
  }
};

module.exports = {
  getOrgReq,
  getOrgReqs,
  processOrgReq,
  createOrgReq,
  acceptMembership,
  rejectMembership,
  orgLogin,
  getOrg,
  getOrgs,
  addMember,
  getBulkJob,
  getAllBulkJobs,
  createBulkJob,
  acceptBulkJob,
  removeBulkJob,
};
