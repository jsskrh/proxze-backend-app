const { getAverageRating } = require("./helpers");

const createTaskpoolObject = (task) => {
  return {
    id: task._id,
    title: task.title,
    description: task.description,
    timeline: task.timeline,
    rating: task.rating,
    lga: task.lga,
    state: task.state,
    bill: task.bill,
  };
};

const createTaskListObject = (task) => {
  return {
    id: task._id,
    title: task.title,
    timeline: task.timeline,
    bill: task.bill,
    proxzi: task.proxzi && `${task.proxzi.firstName} ${task.proxzi.lastName}`,
    principal: `${task.principal.firstName} ${task.principal.lastName}`,
  };
};

const createTaskObject = (task, stream) => {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    timeline: task.timeline,
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
    principalReview: task.principalReview,
    proxziReview: task.proxziReview,
    principal: {
      id: task.principal._id,
      name: `${task.principal.firstName} ${task.principal.lastName}`,
      rating: getAverageRating(task.principal.reviews),
      reviews: task.principal.reviews.length,
      createdAt: task.principal.createdAt,
    },
    proxzi: task.proxzi
      ? {
          id: task.proxzi._id,
          name: `${task.proxzi.firstName} ${task.proxzi.lastName}`,
          rating: getAverageRating(task.proxzi.reviews),
          reviews: task.proxzi.reviews.length,
          createdAt: task.proxzi.createdAt,
        }
      : null,
    offers: task.offers.map((offer) => {
      return {
        proxzi: {
          id: offer.proxzi._id,
          avatar: offer.proxzi.avatar,
          name: `${offer.proxzi.firstName} ${offer.proxzi.lastName}`,
          rating: getAverageRating(offer.proxzi.reviews),
          reviews: offer.proxzi.reviews.length,
          occupation: offer.proxzi.occupation,
          state: offer.proxzi.state,
          createdAt: offer.proxzi.createdAt,
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
    proxzi: task.proxzi
      ? {
          id: task.proxzi._id,
          name: `${task.proxzi.firstName} ${task.proxzi.lastName}`,
          rating: getAverageRating(task.proxzi.reviews),
          reviews: task.proxzi.reviews.length,
          createdAt: task.proxzi.createdAt,
        }
      : null,
    offers: task.offers.map((offer) => {
      return {
        proxzi: {
          id: offer.proxzi._id,
          avatar: offer.proxzi.avatar,
          name: `${offer.proxzi.firstName} ${offer.proxzi.lastName}`,
          rating: getAverageRating(offer.proxzi.reviews),
          reviews: offer.proxzi.reviews.length,
          occupation: offer.proxzi.occupation,
          state: offer.proxzi.state,
          createdAt: offer.proxzi.createdAt,
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
