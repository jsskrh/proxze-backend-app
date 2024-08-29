const dotenv = require("dotenv");
const Task = require("../models/task");
const User = require("../models/user");
const Review = require("../models/review");
const Notification = require("../models/notification");
const Stream = require("../models/stream");
const {
  getAverageRating,
  getDistanceFromLatLonInKm,
} = require("../utils/helpers");
const {
  createTaskObject,
  createTaskpoolObject,
  createTaskListObject,
} = require("../utils/tasks");
const { taskCreator } = require("../utils/tasks");
const { sendPushNotification } = require("../utils/pushNotifications");
const { Expo } = require("expo-server-sdk");
const axios = require("axios");
const mongoose = require("mongoose");
dotenv.config();

const createTask = async (req, res) => {
  try {
    const {
      type,
      description,
      bill,
      // educationLevel,
      // lga,
      // address,
      location,
      // state,
      // occupation,
      // searchRange,
      // isCertified,
      // skillLevel,
      // timeBlock,
      // yearsOfExperience,
      startDate,
      endDate,
    } = req.body;

    const principal = req.user.id;
    const user = await User.findById(req.user.id).populate({ path: "reviews" });

    const createResult = await taskCreator({
      type,
      description,
      bill,
      location,
      startDate,
      endDate,
      principal,
      user,
    });

    // const newTask = await Task.create({
    //   type,
    //   description,
    //   bill,
    //   // educationLevel,
    //   // lga,
    //   // address,
    //   location: {
    //     label: location.label,
    //     geometry: {
    //       type: "Point",
    //       coordinates: [location.coords.lng, location.coords.lat],
    //     },
    //   },
    //   // state,
    //   // occupation,
    //   // searchRange,
    //   // isCertified,
    //   // skillLevel,
    //   // timeBlock,
    //   // yearsOfExperience,
    //   startDate,
    //   endDate,
    //   principal,
    //   rating: getAverageRating(user.reviews),
    //   timeline: [{ status: "created", timestamp: Date.now() }],
    // });

    // const usersWithinRadius = await User.find({
    //   userType: "proxze", // Replace with the actual userType value
    //   location: {
    //     $geoWithin: {
    //       $centerSphere: [[location.coords.lng, location.coords.lat], 5 / 6371], // 5km radius in radians
    //     },
    //   },
    //   token: { $exists: true, $not: { $size: 0 } }, // Non-empty token array
    // });

    // console.log(usersWithinRadius);

    // const expo = new Expo();
    // const notifications = [];

    // for (const user of usersWithinRadius) {
    //   for (const token of user.token) {
    //     notifications.push({
    //       to: token,
    //       sound: "default",
    //       title: "New task available!",
    //       body: "There is a new task close to you",
    //       data: { screenName: "Task", params: { taskId: newTask._id } },
    //     });
    //   }
    // }

    // const chunks = expo.chunkPushNotifications(notifications);

    // for (const chunk of chunks) {
    //   try {
    //     await expo.sendPushNotificationsAsync(chunk);
    //   } catch (error) {
    //     console.error(error);
    //   }
    // }

    // if (Expo.isExpoPushToken(expoPushToken)) {
    //   await sendPushNotification(expoPushToken, message);
    // }
    return res.status(201).json({
      status: true,
      message: "Task created successfully",
      data: createResult,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
};

const getPendingRequests = async (req, res) => {
  try {
    const pendingRequests = await Task.find({
      $expr: {
        $and: [
          { $eq: [{ $size: "$timeline" }, 1] },
          { $eq: [{ $arrayElemAt: ["$timeline.status", 0] }, "created"] },
        ],
      },
    }).sort({
      createdAt: -1,
    });

    const mappedRequests = pendingRequests.map((request) => {
      return createTaskpoolObject(request);
    });

    return res.status(201).json({
      status: true,
      message: "Pending requests fetched",
      data: mappedRequests,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: `Unable to update payment info. Please try again. \n Error: ${error}`,
    });
  }
};

const getTask = async (req, res) => {
  const { taskId } = req.params;

  try {
    const task = await Task.findById(taskId)
      .populate("principal")
      .populate("proxze")
      .populate({
        path: "proxze",
        populate: {
          path: "reviews",
          model: "Review",
        },
      })
      .populate({
        path: "principal",
        populate: {
          path: "reviews",
          model: "Review",
        },
      })
      .populate("offers.proxze")
      .populate("proxzeReview")
      .populate("principalReview");
    //.populate("attachments");
    // .populate("offers.proxze.reviews");

    // if (req.user.id.equals(task.principal._id)) {
    //   // Update the lastViewed field with the current date and time
    //   task.lastViewed = new Date();
    //   await task.save();
    // }

    var stream = {};
    // await axios
    //   .get(`http://localhost:8000/api/streams/live/${taskId}`)
    //   .then(async (response) => {
    //     stream = await response.data;
    //     return;
    //   })
    //   .catch((err) => {
    //     console.log(err);
    //     return err;
    //   });

    return res.status(201).json(task);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
};

const updateLastViewed = async (req, res) => {
  try {
    await Task.findByIdAndUpdate(req.params.taskId, { lastViewed: Date.now() });

    return res.status(201).json({
      status: true,
      message: "Last viewed updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
};

const approveRejectRequest = async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.taskId,
      {
        $push: { timeline: { status: req.params.type, timestamp: Date.now() } },
      },
      { new: true }
    )
      .populate("principal")
      // .populate("principal.reviews")
      .populate("offers.proxze");
    //.populate("attachments");
    // .populate("offers.proxze.reviews");

    const principal = task.principal;

    if (principal.token[0]) {
      const expo = new Expo();
      const notifications = [];

      // for (const user of usersWithinRadius) {
      for (const token of principal.token) {
        notifications.push({
          to: token,
          sound: "default",
          title: "Task update",
          body:
            req.params.type === "approved"
              ? `Your ${task.type} task has been approved`
              : `Your ${task.type} task was rejected`,
          data: { screenName: "Task", params: { taskId: task._id } },
        });
      }
      // }

      const chunks = expo.chunkPushNotifications(notifications);

      for (const chunk of chunks) {
        try {
          await expo.sendPushNotificationsAsync(chunk);
        } catch (error) {
          console.error(error);
        }
      }
    }

    const newNotification = await Notification.create({
      type: "task",
      content:
        req.params.type === "approved"
          ? "Your task has been approved"
          : "Your task was rejected",
      recipient: task.principal._id,
      task: task._id,
    });

    await User.findByIdAndUpdate(task.principal._id, {
      $push: { notifications: newNotification._id },
    });

    return res.status(201).json({
      status: true,
      message: `Task has been ${req.params.type} successfully`,
      data: task,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
};

// const getTaskpool = async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id);
//     const userLocation = user.location;
//     let tasks;

//     if (user.userType === "proxze" && userLocation.coordinates) {
//       tasks = await Task.find({
//         // "timeline.status": "approved",
//         paymentStatus: false,
//         proxze: { $exists: false },
//         "location.geometry": {
//           $geoWithin: {
//             $centerSphere: [
//               [userLocation.coordinates[0], userLocation.coordinates[1]],
//               5 / 6371, // 5km radius in radians
//             ],
//           },
//         },
//       }).sort({
//         createdAt: -1,
//       });
//       console.log("test", tasks);
//     } else {
//       tasks = await Task.find({
//         paymentStatus: false,
//         proxze: { $exists: false },
//       }).sort({
//         createdAt: -1,
//       });
//     }

//     const mappedTasks = tasks.map((task) => {
//       return createTaskpoolObject(task);
//     });

//     return res.status(201).json({
//       status: true,
//       message: "Taskpool fetched",
//       data: tasks,
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({
//       status: false,
//       message: "Server error",
//     });
//   }
// };

const getTaskpool = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("group");
    const userGroupId = user.group ? user.group._id : null;

    let taskQuery = {
      $or: [
        {
          type: "oneToMany",
          group: userGroupId,
        },
        {
          type: "manyToMany",
          group: userGroupId,
        },
        {
          type: "manyToOne",
          group: userGroupId,
        },
        {
          type: "oneToMany",
          group: { $ne: userGroupId },
        },
        {
          type: "manyToMany",
          group: { $ne: userGroupId },
        },
        {
          type: "manyToOne",
          group: { $ne: userGroupId },
        },

        {
          group: null,
          request: null,
        },

        {
          request: null,
        },
      ],
    };

    const tasks = await Task.find(taskQuery).populate({
      path: "request",
      match: {
        $or: [{ network: { $in: ["internal", "both"] } }, { network: null }],
      },
    });

    const filteredTasks = tasks
      .filter((task) => task.request !== null || task.request === undefined)
      .filter((task) => {
        if (task.type === "manyToOne") {
          const taskLocation = task.location?.coordinates;
          const userLocation = user.location?.coordinates;

          if (taskLocation && userLocation) {
            const distance = getDistanceFromLatLonInKm(
              userLocation[0],
              userLocation[1],
              taskLocation[0],
              taskLocation[1]
            );

            return distance <= 5;
          }
          return true;
        }
        return true;
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json({ tasks: filteredTasks });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// const acceptTask = async (req, res) => {
//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     if (!timestamp) {
//       return res.status(401).json({
//         status: false,
//         message: "No cover letter present",
//       });
//     }
//     // if (!coverLetter || !timestamp) {
//     //   return res.status(401).json({
//     //     status: false,
//     //     message: "No cover letter present",
//     //   });
//     // }

//     const task = await Task.findOne({
//       _id: req.params.taskId,
//       proxze: { $exists: false },
//     }).session(session);

//     if (!task) {
//       return res.status(404).json({
//         status: false,
//         message: "Task not found",
//       });
//     }

//     // Set proxze to req.user.id and status to 'approved'
//     task.proxze = req.user.id;
//     task.status = "approved";

//     // Create a new offer
//     const newOffer = {
//       proxze: req.user.id,
//       coverLetter: "",
//       timestamp,
//     };

//     // Add the new offer to the task's offers array
//     task.offers.push(newOffer);

//     if (task.enterprise) {
//       task.timeline.push({ status: "assigned", timestamp: Date.now() });
//       task.timeline.push({ status: "approved", timestamp: Date.now() });
//     }

//     // Save the task with the new offer
//     await task.save();

//     const populatedTask = await Task.findById(task._id)
//       .populate("principal")
//       .populate("principal.reviews")
//       .populate("offers.proxze");
//     //.populate("attachments");
//     // .populate("offers.proxze.reviews");
//     console.log(populatedTask);
//     const principal = await User.findById(populatedTask.principal._id);

//     if (principal.token[0]) {
//       const expo = new Expo();
//       const notifications = [];

//       // for (const user of usersWithinRadius) {
//       for (const token of principal.token) {
//         notifications.push({
//           to: token,
//           sound: "default",
//           title: "New offer!",
//           body: `There is a new offer for your ${task.type} task`,
//           data: { screenName: "Task", params: { taskId: task._id } },
//         });
//       }
//       // }

//       const chunks = expo.chunkPushNotifications(notifications);

//       for (const chunk of chunks) {
//         try {
//           await expo.sendPushNotificationsAsync(chunk);
//         } catch (error) {
//           console.error(error);
//         }
//       }
//     }

//     const newNotification = await Notification.create({
//       type: "task",
//       content: "You have a new offer",
//       recipient: task.principal._id,
//       sender: req.user.id,
//       task: task._id,
//     });

//     await User.findByIdAndUpdate(task.principal._id, {
//       $push: { notifications: newNotification._id },
//     });

//     // Commit the transaction
//     await session.commitTransaction();
//     session.endSession();

//     return res.status(201).json({
//       status: true,
//       message: `Offer has been made`,
//       data: populatedTask,
//     });
//   } catch (error) {
//     await session.abortTransaction();
//     session.endSession();
//     console.log(error);
//     res.status(500).json({
//       status: false,
//       message: "Server error",
//     });
//   }
// };

const makeOffer = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { coverLetter, timestamp } = req.body;

    if (!timestamp) {
      return res.status(401).json({
        status: false,
        message: "No cover letter present",
      });
    }
    // if (!coverLetter || !timestamp) {
    //   return res.status(401).json({
    //     status: false,
    //     message: "No cover letter present",
    //   });
    // }

    const task = await Task.findById(req.params.taskId).session(session);

    if (!task) {
      return res.status(404).json({
        status: false,
        message: "Task not found",
      });
    }

    const myExistingOffer = task.offers.find(
      (offer) => offer.proxze.toString() === req.user.id
    );

    if (myExistingOffer) {
      return res.status(400).json({
        status: false,
        message: "You have already made an offer",
      });
    }

    const existingOffer = task.offers.length > 0;

    if (existingOffer) {
      return res.status(400).json({
        status: false,
        message: "An offer already exists",
      });
    }

    // Create a new offer
    const newOffer = {
      proxze: req.user.id,
      coverLetter,
      timestamp,
    };

    // Add the new offer to the task's offers array
    task.offers.push(newOffer);

    if (task.enterprise) {
      task.timeline.push({ status: "assigned", timestamp: Date.now() });
      task.timeline.push({ status: "approved", timestamp: Date.now() });
    }

    // Save the task with the new offer
    await task.save();

    const populatedTask = await Task.findById(task._id)
      .populate("principal")
      .populate("principal.reviews")
      .populate("offers.proxze");
    //.populate("attachments");
    // .populate("offers.proxze.reviews");
    console.log(populatedTask);
    const principal = await User.findById(populatedTask.principal._id);

    if (principal.token[0]) {
      const expo = new Expo();
      const notifications = [];

      // for (const user of usersWithinRadius) {
      for (const token of principal.token) {
        notifications.push({
          to: token,
          sound: "default",
          title: "New offer!",
          body: `There is a new offer for your ${task.type} task`,
          data: { screenName: "Task", params: { taskId: task._id } },
        });
      }
      // }

      const chunks = expo.chunkPushNotifications(notifications);

      for (const chunk of chunks) {
        try {
          await expo.sendPushNotificationsAsync(chunk);
        } catch (error) {
          console.error(error);
        }
      }
    }

    const newNotification = await Notification.create({
      type: "task",
      content: "You have a new offer",
      recipient: task.principal._id,
      sender: req.user.id,
      task: task._id,
    });

    await User.findByIdAndUpdate(task.principal._id, {
      $push: { notifications: newNotification._id },
    });

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      status: true,
      message: `Offer has been made`,
      data: populatedTask,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.log(error);
    res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
};

const acceptTask = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.taskId, proxze: { $exists: false } },
      {
        proxze: req.user.id,
        status: "approved",
        $push: {
          timeline: {
            $each: [
              {
                status: "assigned",
                timestamp: new Date(),
              },
              {
                status: "approved",
                timestamp: new Date(), // or another timestamp if needed
              },
            ],
          },
        },
      },
      { new: true, session }
    )
      .populate("principal")
      .populate("proxze")
      .populate("principal.reviews")
      .populate("offers.proxze");
    //.populate("attachments");
    // .populate("offers.proxze.reviews");

    if (!task) {
      return res.status(404).json({
        status: false,
        message: "Task has already been assigned",
      });
    }

    const proxze = task.proxze;

    if (proxze.token[0]) {
      const expo = new Expo();
      const notifications = [];

      // for (const user of usersWithinRadius) {
      for (const token of proxze.token) {
        notifications.push({
          to: token,
          sound: "default",
          title: "New task!",
          body: `You have been assigned a task`,
          data: { screenName: "Task", params: { taskId: task._id } },
        });
      }
      // }

      const chunks = expo.chunkPushNotifications(notifications);

      for (const chunk of chunks) {
        try {
          await expo.sendPushNotificationsAsync(chunk);
        } catch (error) {
          console.error(error);
        }
      }
    }

    const newNotification = await Notification.create({
      type: "task",
      content: "You have been assigned a task",
      recipient: task.proxze._id,
      sender: task.principal._id,
      task: task._id,
    });

    await User.findByIdAndUpdate(task.proxze._id, {
      $push: { notifications: newNotification._id },
    });

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      status: true,
      message: `Proxze has been assigned`,
      data: task,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({
      status: false,
      message: "Server error",
      error,
    });
  }
};

const acceptOffer = async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.taskId, proxze: { $exists: false } },
      {
        proxze: req.body.proxze,
        status: "approved",
        $push: {
          timeline: {
            status: "assigned",
            timestamp: req.body.timestamp,
          },
        },
      },
      { new: true }
    )
      .populate("principal")
      .populate("proxze")
      .populate("principal.reviews")
      .populate("offers.proxze");
    //.populate("attachments");
    // .populate("offers.proxze.reviews");

    if (!task) {
      return res.status(404).json({
        status: false,
        message: "Task has already been assigned",
      });
    }

    const proxze = task.proxze;

    if (proxze.token[0]) {
      const expo = new Expo();
      const notifications = [];

      // for (const user of usersWithinRadius) {
      for (const token of proxze.token) {
        notifications.push({
          to: token,
          sound: "default",
          title: "New task!",
          body: `You have been assigned a task`,
          data: { screenName: "Task", params: { taskId: task._id } },
        });
      }
      // }

      const chunks = expo.chunkPushNotifications(notifications);

      for (const chunk of chunks) {
        try {
          await expo.sendPushNotificationsAsync(chunk);
        } catch (error) {
          console.error(error);
        }
      }
    }

    const newNotification = await Notification.create({
      type: "task",
      content: "You have been assigned a task",
      recipient: task.proxze._id,
      sender: task.principal._id,
      task: task._id,
    });

    await User.findByIdAndUpdate(task.proxze._id, {
      $push: { notifications: newNotification._id },
    });

    return res.status(201).json({
      status: true,
      message: `Proxze has been assigned`,
      data: task,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
};

const rejectOffer = async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.taskId },
      {
        $push: {
          rejects: req.body.proxze,
        },
        $set: {
          "offers.$[offer].isRejected": true,
        },
      },
      {
        new: true,
        arrayFilters: [{ "offer.proxze": req.body.proxze }],
      }
    )
      .populate("principal")
      // .populate("proxze")
      .populate("principal.reviews")
      .populate("offers.proxze");
    //.populate("attachments");
    // .populate("offers.proxze.reviews");

    if (!task) {
      return res.status(404).json({
        status: false,
        message: "Task does not exist",
      });
    }

    return res.status(201).json({
      status: true,
      message: `Proxze has been rejected`,
      data: task,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
};

const startTask = async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      {
        _id: req.params.taskId,
        proxze: { $exists: true },
      },
      {
        $push: {
          timeline: {
            status: "started",
            timestamp: req.body.timestamp,
          },
        },
      },
      { new: true }
    )
      .populate("principal")
      .populate("proxze")
      .populate("principal.reviews")
      .populate("offers.proxze");
    //.populate("attachments");
    // .populate("offers.proxze.reviews");

    if (!task) {
      return res.status(404).json({
        status: false,
        message: "Task not yet assigned",
      });
    }

    const proxze = task.proxze;
    const principal = task.principal;

    // if (proxze.token[0] || principal.token[0]) {
    const expo = new Expo();
    const notifications = [];

    // for (const user of usersWithinRadius) {
    if (proxze.token[0]) {
      for (const token of proxze.token) {
        notifications.push({
          to: token,
          sound: "default",
          title: "Task started!",
          body: `Your ${task.type} task has begun`,
          data: { screenName: "Task", params: { taskId: task._id } },
        });
      }
    }

    if (principal.token[0]) {
      for (const token of principal.token) {
        notifications.push({
          to: token,
          sound: "default",
          title: "Task started!",
          body: `Your ${task.type} task has begun`,
          data: { screenName: "Task", params: { taskId: task._id } },
        });
      }
    }
    // }

    if (notifications.length !== 0) {
      const chunks = expo.chunkPushNotifications(notifications);

      for (const chunk of chunks) {
        try {
          await expo.sendPushNotificationsAsync(chunk);
        } catch (error) {
          console.error(error);
        }
      }
    }
    // }

    const newPrincipalNotification = await Notification.create({
      type: "task",
      content: `Your ${task.type} task has started`,
      recipient: task.principal._id,
      task: task._id,
    });

    const newProxzeNotification = await Notification.create({
      type: "task",
      content: `Your ${task.type} task has started`,
      recipient: task.proxze._id,
      task: task._id,
    });

    await User.findByIdAndUpdate(task.principal._id, {
      $push: { notifications: newPrincipalNotification._id },
    });

    await User.findByIdAndUpdate(task.proxze._id, {
      $push: { notifications: newProxzeNotification._id },
    });

    return res.status(201).json({
      status: true,
      message: `Task has started`,
      data: task,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
};

const uploadAttachment = async (req, res) => {
  const { url, duration, size, timestamp } = req.body;
  try {
    const task = await Task.findOneAndUpdate(
      {
        _id: req.params.taskId,
        "timeline.status": "started",
      },
      {
        $push: {
          attachments: {
            url,
            timestamp,
            size,
            duration,
          },
        },
      },
      { new: true }
    )
      .populate("principal")
      .populate("proxze")
      .populate("principal.reviews")
      .populate("offers.proxze");
    //.populate("attachments");
    // .populate("offers.proxze.reviews");

    if (!task) {
      return res.status(404).json({
        status: false,
        message: "Task not yet started",
      });
    }

    return res.status(201).json({
      status: true,
      message: `File has been saved`,
      data: task,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
};

const completeTask = async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      {
        _id: req.params.taskId,
        "timeline.status": "started",
        // attachments: { $exists: true, $ne: [] },
      },
      {
        $push: {
          timeline: {
            status: "completed",
            timestamp: req.body.timestamp,
          },
        },
      },
      { new: true }
    )
      .populate("principal")
      .populate("proxze")
      .populate("principal.reviews")
      .populate("offers.proxze");
    //.populate("attachments");
    // .populate("offers.proxze.reviews");

    if (!task) {
      return res.status(404).json({
        status: false,
        message: "Task attachments have not been uploaded",
      });
    }

    const principal = task.principal;

    if (principal.token[0]) {
      const expo = new Expo();
      const notifications = [];

      // for (const user of usersWithinRadius) {
      for (const token of principal.token) {
        notifications.push({
          to: token,
          sound: "default",
          title: "Task completed!",
          body: `Your ${task.type} task has been completed`,
          data: { screenName: "Task", params: { taskId: task._id } },
        });
      }
      // }

      const chunks = expo.chunkPushNotifications(notifications);

      for (const chunk of chunks) {
        try {
          await expo.sendPushNotificationsAsync(chunk);
        } catch (error) {
          console.error(error);
        }
      }
    }

    const newNotification = await Notification.create({
      type: "task",
      content: `Your ${task.type} task has been completed`,
      recipient: task.principal._id,
      sender: task.proxze._id,
      task: task._id,
    });

    await User.findByIdAndUpdate(task.principal._id, {
      $push: { notifications: newNotification._id },
    });

    return res.status(201).json({
      status: true,
      message: `Task has been completed`,
      data: task,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
};

const confirmTask = async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      {
        _id: req.params.taskId,
        "timeline.status": "completed",
      },
      {
        $push: {
          timeline: {
            status: "confirmed",
            timestamp: req.body.timestamp,
          },
        },
      },
      { new: true }
    )
      .populate("principal")
      .populate("proxze")
      .populate("principal.reviews")
      .populate("offers.proxze");
    //.populate("attachments");
    // .populate("offers.proxze.reviews");

    if (!task) {
      return res.status(404).json({
        status: false,
        message: "Task has not yet been completed",
      });
    }

    const proxze = task.proxze;

    if (proxze.token[0]) {
      const expo = new Expo();
      const notifications = [];

      // for (const user of usersWithinRadius) {
      for (const token of proxze.token) {
        notifications.push({
          to: token,
          sound: "default",
          title: "Task confirmed!",
          body: `Your completed task has been confirmed`,
          data: { screenName: "Task", params: { taskId: task._id } },
        });
      }
      // }

      const chunks = expo.chunkPushNotifications(notifications);

      for (const chunk of chunks) {
        try {
          await expo.sendPushNotificationsAsync(chunk);
        } catch (error) {
          console.error(error);
        }
      }
    }

    const newNotification = await Notification.create({
      type: "task",
      content: `Your completed task has been confirmed`,
      recipient: task.proxze._id,
      sender: task.principal._id,
      task: task._id,
    });

    await User.findByIdAndUpdate(task.proxze._id, {
      $push: { notifications: newNotification._id },
    });

    return res.status(201).json({
      status: true,
      message: `Task has been confirmed`,
      data: task,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
};

const getOngoingTasks = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    let tasks = [];

    if (user.userType === "proxze") {
      tasks = await Task.find({
        proxze: user._id,
        "timeline.status": { $nin: ["rejected", "confirmed"] },
      })
        .populate("principal")
        .populate("proxze")
        .sort({
          createdAt: -1,
        });
    } else if (user.userType === "principal") {
      tasks = await Task.find({
        principal: user._id,
        "timeline.status": { $nin: ["rejected", "confirmed"] },
      })
        .populate("principal")
        .populate("proxze")
        .sort({
          createdAt: -1,
        });
    } else {
      tasks = await Task.find({
        "timeline.status": { $nin: ["rejected", "confirmed"] },
      })
        .populate("principal")
        .populate("proxze")
        .sort({
          createdAt: -1,
        });
    }

    // const mappedTasks = tasks.map((task) => {
    //   return createTaskListObject(task);
    // });

    console.log("tasks", tasks);

    return res.status(201).json({
      status: true,
      message: "Pending requests fetched",
      data: tasks,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
};

const getTaskHistory = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    let tasks = [];

    if (user.userType === "proxze") {
      tasks = await Task.find({
        proxze: user._id,
        timeline: {
          $elemMatch: {
            status: { $in: ["rejected", "confirmed"] },
          },
        },
      })
        .populate("principal")
        .populate("proxze")
        .sort({
          createdAt: -1,
        });
    } else if (user.userType === "principal") {
      tasks = await Task.find({
        principal: user._id,
        timeline: {
          $elemMatch: {
            status: { $in: ["rejected", "confirmed"] },
          },
        },
      })
        .populate("principal")
        .populate("proxze")
        .sort({
          createdAt: -1,
        });
    } else {
      tasks = await Task.find({
        timeline: {
          $elemMatch: {
            status: { $in: ["rejected", "confirmed"] },
          },
        },
      })
        .populate("principal")
        .populate("proxze")
        .sort({
          createdAt: -1,
        });
    }

    const mappedTasks = tasks.map((task) => {
      return createTaskListObject(task);
    });

    return res.status(201).json({
      status: true,
      message: "Pending requests fetched",
      data: mappedTasks,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
};

const handleLive = async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      {
        _id: req.params.taskId,
        proxze: { $exists: true },
      },
      {
        live: req.body.type,
      },
      { new: true }
    )
      .populate("principal")
      .populate("proxze")
      .populate("principal.reviews")
      .populate("offers.proxze");
    //.populate("attachments");
    // .populate("offers.proxze.reviews");

    if (!task) {
      return res.status(404).json({
        status: false,
        message: "Task not yet assigned",
      });
    }

    // const newPrincipalNotification = await Message.create({
    //   type: "live",
    //   recipient: task.principal._id,
    //   task: task._id,
    // });

    // await User.findByIdAndUpdate(task.principal._id, {
    //   $push: { notifications: newPrincipalNotification._id },
    // });

    return res.status(201).json({
      status: true,
      message: `Task updated`,
      data: createAssignedTaskObject(task),
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
};

module.exports = {
  createTask,
  getTask,
  getPendingRequests,
  updateLastViewed,
  approveRejectRequest,
  getTaskpool,
  makeOffer,
  acceptOffer,
  rejectOffer,
  startTask,
  uploadAttachment,
  completeTask,
  confirmTask,
  getOngoingTasks,
  getTaskHistory,
  handleLive,
  acceptTask,
};
