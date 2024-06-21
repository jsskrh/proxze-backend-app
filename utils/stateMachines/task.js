const states = {
  CREATED: "created",
  ASSIGNED: "assigned",
  APPROVED: "approved",
  STARTED: "started",
  COMPLETED: "completed",
  CONFIRMED: "confirmed",
};

const transitions = {
  assign: {
    [states.CREATED]: states.ASSIGNED,
  },
  approve: {
    [states.ASSIGNED]: states.APPROVED,
  },
  start: {
    [states.APPROVED]: states.STARTED,
  },
  complete: {
    [states.STARTED]: states.COMPLETED,
  },
  confirm: {
    [states.COMPLETED]: states.CONFIRMED,
  },
};

const updateTaskStatus = (event, taskStatus) => {
  try {
    const nextState = transitions[event][taskStatus];
    if (nextState) {
      return nextState;
    } else {
      throw new Error(`Invalid state transition or event.`);
    }
  } catch (error) {
    return {
      error: {
        message: `Unable to update request status.`,
        error: error.message,
      },
    };
  }
};

module.exports = { updateTaskStatus, states };
