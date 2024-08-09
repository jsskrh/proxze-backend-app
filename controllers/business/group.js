const Group = require("../../models/business/group");
const User = require("../../models/user");
const { sendGroupRegistrationMail } = require("../../utils/mail");

const addSingleProxzeToGroupHelper = async (email, groupId) => {
  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new Error(`User already exists with email: ${email}`);
  }

  const groupExists = await Group.findById(groupId);
  if (!groupExists) {
    throw new Error(`Group does not exist`);
  }

  const user = await User.create({
    email,
    userType: "proxze",
    group: groupId,
  });

  await Group.findByIdAndUpdate(groupId, {
    $push: { proxzes: user._id },
  });

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
    const groups = await Group.find({ principalId: req.params.principalId });
    res.json(groups);
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
      group: groupId,
    });
    console.log(user);
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
    const { emails, groupId } = req.body; // Expecting an array of emails
    console.log(emails);
    const addAllProxzes = emails.map((email) =>
      addSingleProxzeToGroupHelper(email, groupId)
    );
    await Promise.all(addAllProxzes);

    return res.status(201).json({
      status: true,
      message: "Successfully added all proxies",
    });
  } catch (err) {
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
      sortBy,
      orderBy,
      startDate,
      endDate,
      groupId,
    } = req.query;
    const perPage = 15;
    let query = {
      group: groupId,
      userType: "proxze",
    };
    let sortQuery = {};

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    if (isVerified !== undefined && isVerified !== "") {
      query.isVerified = isVerified === "true";
    }
    if (state) {
      query.$or = query.$or || [];
      query.$or.push({ "resAddress.state": state }, { "address.state": state });
    }
    if (lga) {
      query.$or = query.$or || [];
      query.$or.push({ "resAddress.lga": lga }, { "address.lga": lga });
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
