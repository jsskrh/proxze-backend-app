const Group = require("../../models/business/group");
const User = require("../../models/user");
const {
  sendGroupRegistrationMail,
  generateRegistrationLink,
} = require("../../utils/mail");

const addSingleProxzeToGroupHelper = async (email, groupIds) => {
  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new Error(`User already exists with email: ${email}`);
  }

  const groupsExist = await Group.find({ _id: { $in: groupIds } });
  if (groupsExist.length !== groupIds.length) {
    throw new Error(`One or more groups do not exist`);
  }

  const user = await User.create({
    email,
    userType: "proxze",
    $addToSet: { groups: { $each: groupIds } },
  });

  await Group.updateMany(
    { _id: { $in: groupIds } },
    { $addToSet: { proxzes: user._id } }
  );

  await sendGroupRegistrationMail(user);

  return user;
};

exports.createGroup = async (req, res) => {
  const { name, description, principalId } = req.body;
  try {
    const group = new Group({ name, description, principalId });
    await group.save();
    res.status(201).json(group);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateGroup = async (req, res) => {
  try {
    const group = await Group.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(group);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteGroup = async (req, res) => {
  try {
    await Group.findByIdAndDelete(req.params.id);
    res.json({ message: "Group deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getGroupById = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    res.json(group);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getAllGroupsByPrincipalId = async (req, res) => {
  try {
    const { principalId } = req.params;
    const { page = 1, perPage = 15, sort = "desc", search = "" } = req.query;

    const query = {
      principalId,
      name: { $regex: search, $options: "i" },
    };

    const groupsCount = await Group.countDocuments(query);

    const groups = await Group.find(query)
      .sort({ createdAt: sort === "asc" ? 1 : -1 })
      .skip((page - 1) * perPage)
      .limit(parseInt(perPage));

    res.json({ groups, count: groupsCount });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.addSingleProxzeToGroup = async (req, res) => {
  try {
    const { email, groupId } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res
        .status(400)
        .json({ error: `User already exists with email: ${email}` });
    }

    const groupExists = await Group.findById(groupId);
    if (!groupExists) {
      return res.status(404).json({ error: `Group does not exist` });
    }
    const user = await User.create({
      email,
      userType: "proxze",
      $addToSet: { groups: groupId },
    });

    await Group.findByIdAndUpdate(groupId, {
      $push: { proxzes: user._id },
    });

    await sendGroupRegistrationMail(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.addBulkProxzeToGroup = async (req, res) => {
  try {
    const { emails, groupIds } = req.body;

    const addAllProxzes = emails.map((email) =>
      addSingleProxzeToGroupHelper(email, groupIds)
    );
    await Promise.all(addAllProxzes);

    return res.status(201).json({
      status: true,
      message: "Successfully added all proxies",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: false,
      message: `Unable to add some or all proxies. Please try again.`,
      error: err.message || err,
    });
  }
};

exports.getGroupProxzes = async (req, res) => {
  try {
    const {
      page = 1,
      search,
      isVerified,
      state,
      lga,
      sortBy = "createdAt",
      orderBy = "descending",
      groupId,
      startDate,
      endDate,
    } = req.query;

    const perPage = 15;
    let query = {
      userType: "proxze",
    };

    let sortQuery = {};

    const orConditions = [];

    if (groupId) {
      orConditions.push(
        { groups: { $in: Array.isArray(groupId) ? groupId : [groupId] } },
        { group: { $in: Array.isArray(groupId) ? groupId : [groupId] } }
      );
    }

    if (search) {
      orConditions.push(
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      );
    }

    if (state) {
      orConditions.push(
        { "resAddress.state": state },
        { "address.state": state }
      );
    }

    if (lga) {
      orConditions.push({ "resAddress.lga": lga }, { "address.lga": lga });
    }

    if (orConditions.length > 0) {
      query.$or = orConditions;
    }

    if (isVerified !== undefined && isVerified !== "") {
      query.isVerified = isVerified === "true";
    }

    if (startDate) {
      query.createdAt = query.createdAt || {};
      query.createdAt.$gte = new Date(startDate);
    }

    if (endDate) {
      query.createdAt = query.createdAt || {};
      query.createdAt.$lte = new Date(endDate);
    }

    if (sortBy) {
      sortQuery[sortBy] = orderBy === "descending" ? -1 : 1;
    }

    const proxzes = await User.find(query)
      .sort(sortQuery)
      .skip((page - 1) * perPage)
      .limit(perPage);

    const count = await User.countDocuments(query);
    const hasNextPage = page * perPage < count;

    return res.status(200).json({
      status: true,
      message: "Group proxzes fetched",
      data: {
        count,
        proxzes,
        hasNextPage,
      },
    });
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({
      status: false,
      message: `Unable to get users. Please try again.`,
      error: err.message || err,
    });
  }
};

exports.generateInviteLink = async (req, res) => {
  try {
    const { groupIds } = req.body;
    if (!groupIds.filter(Boolean).length < 1) {
      return res.status(404).json({ error: `Kindly Add at least a group` });
    }

    const link = await generateRegistrationLink(groupIds);

    return res.status(200).json({
      status: true,
      message: "Link generated successfully!",
      data: link,
    });
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({
      status: false,
      message: "Error generating link",
      error: err.message || err,
    });
  }
};
