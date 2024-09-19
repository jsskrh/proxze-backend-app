const { getAverageRating } = require("./helpers");
const dotenv = require("dotenv");
const Task = require("../models/task");
const User = require("../models/user");
const Review = require("../models/review");
const Notification = require("../models/notification");
const Stream = require("../models/stream");
const { sendPushNotification } = require("./pushNotifications");
const { Expo } = require("expo-server-sdk");
const axios = require("axios");
const mongoose = require("mongoose");
dotenv.config();

const taskCreator = async ({
  type,
  description,
  bill,
  location,
  startDate,
  endDate,
  principal,
  user,
  tier,
  organization,
  group,
  isProxzeBusiness,
  request,
  referralToken,
}) => {
  const newTask = await Task.create({
    type,
    description,
    bill,
    // educationLevel,
    // lga,
    // address,
    location: {
      label: location.label || "proxzeBusiness",
      geometry: {
        type: "Point",
        coordinates: [location.coords.lng, location.coords.lat],
      },
    },
    // state,
    // occupation,
    // searchRange,
    // isCertified,
    // skillLevel,
    // timeBlock,
    // yearsOfExperience,
    startDate,
    endDate,
    principal,
    organization,
    referralToken,
    rating: getAverageRating(user.reviews),
    timeline: [{ status: "created", timestamp: Date.now() }],
    tier: tier ?? "basic",
    group,
    isProxzeBusiness,
    request,
  });

  // const usersWithinRadius = await User.find({
  //   userType: "proxze", // Replace with the actual userType value
  //   location: {
  //     $geoWithin: {
  //       $centerSphere: [[location.coords.lng, location.coords.lat], 5 / 6371], // 5km radius in radians
  //     },
  //   },
  //   token: { $exists: true, $not: { $size: 0 } }, // Non-empty token array
  // });

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

  return newTask;
};

const createTaskpoolObject = (task) => {
  return {
    id: task._id,
    type: task.type,
    description: task.description,
    timeline: task.timeline,
    rating: task.rating,
    location: task.location,
    bill: task.bill,
    createdAt: task.createdAt,
    startDate: task.startDate,
    endDate: task.endDate,
  };
};

const createTaskListObject = (task) => {
  return {
    id: task._id,
    type: task.type,
    timeline: task.timeline,
    bill: task.bill,
    proxze: task.proxze && `${task.proxze.firstName} ${task.proxze.lastName}`,
    principal: `${task.principal.firstName} ${task.principal.lastName}`,
    location: task.location,
    createdAt: task.createdAt,
    startDate: task.startDate,
    endDate: task.endDate,
  };
};

const createTaskObject = (task, stream) => {
  return {
    id: task.id,
    type: task.type,
    description: task.description,
    timeline: task.timeline,
    // lga: task.lga,
    // state: task.state,
    location: task.location,
    bill: task.bill,
    // occupation: task.occupation,
    // educationLevel: task.educationLevel,
    // skillLevel: task.skillLevel,
    // isCertified: task.isCertified,
    // searchRange: task.searchRange,
    // timeBlock: task.timeBlock,
    paymentStatus: task.paymentStatus,
    // yearsOfExperience: task.yearsOfExperience,
    startDate: task.startDate,
    endDate: task.endDate,
    principalReview: task.principalReview,
    proxzeReview: task.proxzeReview,
    principal: {
      id: task.principal._id,
      name: `${task.principal.firstName} ${task.principal.lastName}`,
      rating: getAverageRating(task.principal.reviews),
      reviews: task.principal.reviews.length,
      createdAt: task.principal.createdAt,
    },
    proxze: task.proxze
      ? {
          id: task.proxze._id,
          name: `${task.proxze.firstName} ${task.proxze.lastName}`,
          rating: getAverageRating(task.proxze.reviews),
          reviews: task.proxze.reviews.length,
          createdAt: task.proxze.createdAt,
        }
      : null,
    offers: task.offers.map((offer) => {
      return {
        proxze: {
          id: offer.proxze._id,
          avatar: offer.proxze.avatar,
          name: `${offer.proxze.firstName} ${offer.proxze.lastName}`,
          rating: getAverageRating(offer.proxze.reviews),
          reviews: offer.proxze.reviews.length,
          occupation: offer.proxze.occupation,
          state: offer.proxze.state,
          createdAt: offer.proxze.createdAt,
        },
        chat: offer.chat ? offer.chat : null,
        coverLetter: offer.coverLetter,
        timestamp: offer.timestamp,
        isRejected: offer.isRejected,
      };
    }),
    attachments: task.attachments,
    live: task.live,
    proxzeStream: stream ? stream : { isLive: false },
    createdAt: task.createdAt,
  };
};

const createAssignedTaskObject = (task) => {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    timeline: task.timeline,
    rating: task.rating,
    lga: task.lga,
    state: task.state,
    bill: task.bill,
    occupation: task.occupation,
    educationLevel: task.educationLevel,
    skillLevel: task.skillLevel,
    isCertified: task.isCertified,
    searchRange: task.searchRange,
    timeBlock: task.timeBlock,
    paymentStatus: task.paymentStatus,
    yearsOfExperience: task.yearsOfExperience,
    startDate: task.startDate,
    endDate: task.endDate,
    principal: {
      id: task.principal._id,
      name: `${task.principal.firstName} ${task.principal.lastName}`,
      rating: getAverageRating(task.principal.reviews),
      reviews: task.principal.reviews.length,
      createdAt: task.principal.createdAt,
    },
    proxze: task.proxze
      ? {
          id: task.proxze._id,
          name: `${task.proxze.firstName} ${task.proxze.lastName}`,
          rating: getAverageRating(task.proxze.reviews),
          reviews: task.proxze.reviews.length,
          createdAt: task.proxze.createdAt,
        }
      : null,
    offers: task.offers.map((offer) => {
      return {
        proxze: {
          id: offer.proxze._id,
          avatar: offer.proxze.avatar,
          name: `${offer.proxze.firstName} ${offer.proxze.lastName}`,
          rating: getAverageRating(offer.proxze.reviews),
          reviews: offer.proxze.reviews.length,
          occupation: offer.proxze.occupation,
          state: offer.proxze.state,
          createdAt: offer.proxze.createdAt,
        },
        chat: offer.chat ? offer.chat : null,
        coverLetter: offer.coverLetter,
        timestamp: offer.timestamp,
      };
    }),
    live: task.live,
    createdAt: task.createdAt,
  };
};

module.exports = {
  taskCreator,
  createTaskObject,
  createTaskpoolObject,
  createTaskListObject,
  createAssignedTaskObject,
};

function secondsToDhmsSimple(seconds) {
  seconds = Number(seconds);
  let d = Math.floor(seconds / (3600 * 24));
  let h = Math.floor((seconds % (3600 * 24)) / 3600);
  let m = Math.floor((seconds % 3600) / 60);
  let s = Math.floor(seconds % 60);

  let dDisplay = d > 0 ? d + "d," : "";
  let hDisplay = h > 0 ? h + "h," : "";
  let mDisplay = m > 0 ? m + "m," : "";
  let sDisplay = s + "s";
  return dDisplay + hDisplay + mDisplay + sDisplay;
}
