const Request = require("../../models/business/request");
const User = require("../../models/user");
const { taskCreator } = require("../../utils/tasks");
const getLatLng = require("../../utils/location");

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
    class: className,
    schedule,
    tasks,
  } = req.body;
  try {
    console.log(tasks);

    const principal = await User.findById(principalId).populate({
      path: "reviews",
    });
    for (const task of JSON.parse(tasks)) {
      const { lat, lng } = await getLatLng(task.address);
      singleTask = {
        type: type,
        description: task.description,
        principal: principalId,
        group: groupId,
        startDate: task.startDate,
        endDate: task.endDate,
        location: {
          coords: {
            lat,
            lng,
          },
        },
        isProxzeBusiness: true,
        user: principal,
      };
      await taskCreator(singleTask);
    }

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
      class: className,
      schedule,
    });

    await request.save();
    res.status(201).json(request);
  } catch (error) {
    console.error(error);
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
