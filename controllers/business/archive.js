const Archive = require("../../models/business/archive");

exports.createArchive = async (req, res) => {
  const { type, proxyId, principalId, url } = req.body;
  try {
    const archive = new Archive({ type, proxyId, principalId, url });
    await archive.save();
    res.status(201).json(archive);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateArchive = async (req, res) => {
  try {
    const archive = await Archive.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(archive);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteArchive = async (req, res) => {
  try {
    await Archive.findByIdAndDelete(req.params.id);
    res.json({ message: "Archive deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getArchiveById = async (req, res) => {
  try {
    const archive = await Archive.findById(req.params.id);
    res.json(archive);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getAllArchivesByPrincipalId = async (req, res) => {
  try {
    const archives = await Archive.find({
      principalId: req.params.principalId,
    });
    res.json(archives);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
