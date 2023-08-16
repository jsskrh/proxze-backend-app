const { getAverageRating } = require("./helpers");

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
