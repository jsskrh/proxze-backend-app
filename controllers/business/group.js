const Group = require("../../models/business/group");

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
