const states = {
  PENDING: "pending",
  REVIEWING: "reviewing",
  APPROVED: "approved",
  REJECTED: "rejected",
};

const transitions = {
  review: {
    [states.PENDING]: states.REVIEWING,
  },
  approve: {
    [states.REVIEWING]: states.APPROVED,
  },
  reject: {
    [states.REVIEWING]: states.REJECTED,
  },
};

const updateReqStatus = (event, reqStatus) => {
  try {
    const nextState = transitions[event][reqStatus];
    if (nextState) {
      return nextState;
    } else {
      throw new Error(`Invalid state transition or event.`);
    }
  } catch (error) {
    return {
      error: {
        message: `Unable to update request status. \n Error: ${error.message}`,
      },
    };
  }
};

module.exports = { updateReqStatus, states };
