const Log = require("../models/log");

const createLog = async ({ action, userId, entityType, entityId, details }) => {
  try {
    const logEntry = new Log({
      action,
      user: userId,
      entityId,
      entityType,
      details,
    });

    await logEntry.save();
    console.log("Log entry created successfully");
  } catch (error) {
    console.error("Error creating log entry:", error);
  }
};

module.exports = { createLog };
