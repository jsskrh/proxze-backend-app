const Permission = require("../../models/business/permission");
const User = require("../../models/user");


exports.updatePermission = async (req, res) => {
  try {
    const permission = await Permission.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(permission);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deletePermission = async (req, res) => {
  try {
    await Permission.findByIdAndDelete(req.params.id);
    res.json({ message: "Permission deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getPermissionById = async (req, res) => {
  try {
    const permission = await Permission.findById(req.params.id);
    res.json(permission);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getAllPermissionsByPrincipalId = async (req, res) => {
  try {
    const permissions = await Permission.find({
      principalId: req.params.principalId,
    });
    res.json(permissions);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
