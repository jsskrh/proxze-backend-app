const mongoose = require("mongoose");

const wakeServer = async (req, res) => {
  return res.status(201).json({
    status: true,
    message: "Server awake",
  });
};

module.exports = {
  wakeServer,
};
