const Request = require("../../models/business/request");

exports.createRequest = async (req, res) => {
  const {
    type,
    network,
    payment,
    image,
    doc,
    tag,
    description,
    principalId,
    groupId,
    title,
    class:className,
    schedule
  } = req.body;
  try {
    const request = new Request({
      type,
      network,
      payment,
      image,
      doc,
      tag,
      description,
      principalId,
      groupId,
      title,
      class:className,
      schedule
    });
    await request.save();
    res.status(201).json(request);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateRequest = async (req, res) => {
  try {
    const request = await Request.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(request);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteRequest = async (req, res) => {
  try {
    await Request.findByIdAndDelete(req.params.id);
    res.json({ message: "Request deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getRequestById = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    res.json(request);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getAllRequestsByPrincipalId = async (req, res) => {
  try {
    const requests = await Request.find({
      principalId: req.params.principalId,
    });
    res.json(requests);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
