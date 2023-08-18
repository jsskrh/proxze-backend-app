const createNotificationObject = (notification) => {
  return {
    id: notification._id,
    title: task.title,
    description: task.description,
    timeline: task.timeline,
    rating: task.rating,
    lga: task.lga,
    state: task.state,
    bill: task.bill,
  };
};

module.exports = {
  createNotificationObject,
};
