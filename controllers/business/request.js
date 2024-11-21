const Request = require("../../models/business/request");
const User = require("../../models/user");
const Task = require("../../models/task");
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
    startDate,
    endDate,
  } = req.body;
  try {
    const principal = await User.findById(principalId).populate({
      path: "reviews",
    });
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

    const savedrequest = await request.save();

    if (tasks) {
      for (const task of JSON.parse(tasks)) {
        const { lat, lng } = await getLatLng(task.address);
        singleTask = {
          type: type,
          description: task.description,
          principal: principalId,
          group: groupId,
          request: savedrequest._id,
          startDate: task.startDate,
          endDate: task.endDate,
          address: task.address,
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
    } else {
      const { lat, lng } = await getLatLng(tag);
      const task = {
        type: type,
        description: description,
        principal: principalId,
        group: groupId,
        request: savedrequest._id,
        tag,
        address: tag,
        location: {
          coords: {
            lat,
            lng,
          },
        },
        startDate,
        endDate,
        isProxzeBusiness: true,
        user: principal,
      };

      await taskCreator(task);
    }

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

exports.getTasksByRequestId = async (req, res) => {
  try {
    const tasks = await Task.find({ request: req.params.id });
    return res.json(tasks);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getAllRequestsByPrincipalId = async (req, res) => {
  try {
    const { principalId } = req.params;
    const { page = 1, perPage = 15, search = "", sort = "desc" } = req.query;

    const query = {
      principalId,
      title: { $regex: search, $options: "i" },
    };

    const totalCount = await Request.countDocuments(query);

    const requests = await Request.find(query)
      .populate({
        path: "groupId",
        select: "name",
      })
      .sort({ createdAt: sort === "asc" ? 1 : -1 })
      .skip((page - 1) * perPage)
      .limit(parseInt(perPage));

    const formattedRequests = requests.map((request) => {
      const { groupId, ...rest } = request.toObject();
      return {
        ...rest,
        groupName: groupId?.name || null,
      };
    });

    res.json({
      requests: formattedRequests,
      count: totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / perPage),
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
