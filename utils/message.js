const createMessageObject = (message) => {
  return {
    id: message._id,
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
  createMessageObject,
};
