const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const Task = require("../models/task");
// const Chat = require("../models/chat");

function authToken(req, res, next) {
  if (
    !req.body.token &&
    !req.query.token &&
    !req.headers["x-access-token"] &&
    !req.headers["authorization"]
  ) {
    return res.status(404).json({
      status: false,
      message: "User not authenticated",
    });
  }

  const authHeader = req.headers["authorization"];

  const token =
    req.body.token ||
    req.query.token ||
    req.headers["x-access-token"] ||
    authHeader.split(" ")[1];

  if (!token) {
    return res.status(403).json({
      status: false,
      message: "A token is required for authentication",
    });
  }
  try {
    const user = jwt.verify(token, process.env.ACCESS_TOKEN);
    req.user = user;
  } catch (err) {
    return res.status(401).json({
      status: false,
      message: "Invalid Token",
    });
  }
  return next();
}

async function passwordCheck(req, res, next) {
  const { password } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (await bcrypt.compare(password, user.password)) {
      return next();
    } else {
      return res.status(401).json({
        status: false,
        message: "Incorrect password",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
}

async function isPrincipal(req, res, next) {
  try {
    const user = await User.findById(req.user.id);
    if (user.userType === "principal" || user.userType === "admin") {
      return next();
    } else {
      return res.status(401).json({
        status: false,
        message: "You are not authorized",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
}

async function isProxze(req, res, next) {
  try {
    const user = await User.findById(req.user.id);
    if (user.userType === "proxze" || user.userType === "admin") {
      return next();
    } else {
      return res.status(401).json({
        status: false,
        message: "You are not authorized",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
}

async function isAdmin(req, res, next) {
  try {
    const user = await User.findById(req.user.id);
    if (user.userType === "admin") {
      return next();
    } else {
      return res.status(401).json({
        status: false,
        message: "You are not authorized",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
}

async function isOwnerPrincipal(req, res, next) {
  try {
    const user = await User.findById(req.user.id);
    const task = await Task.findById(req.params.taskId);
    if (user._id.equals(task.principal) || user.userType === "admin") {
      return next();
    } else {
      return res.status(401).json({
        status: false,
        message: "You are not authorized",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
}

async function isOwnerProxze(req, res, next) {
  try {
    const user = await User.findById(req.user.id);
    const task = await Task.findById(req.params.taskId);
    if (user._id.equals(task.proxze) || user.userType === "admin") {
      return next();
    } else {
      return res.status(401).json({
        status: false,
        message: "You are not authorized",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
}

async function isPaid(req, res, next) {
  try {
    if (await Task.findById(req.params.taskId).paymentStatus) {
      return res.status(401).json({
        status: false,
        message: "Task has not been paid for yet",
      });
    } else {
      return next();
    }
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
}

async function isTaskUnassigned(req, res, next) {
  try {
    if (await Task.findById(req.params.taskId).proxze) {
      return res.status(401).json({
        status: false,
        message: "You are not authorized",
      });
    } else {
      return next();
    }
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
}

// async function accessChat(req, res, next) {
//   try {
//     const chat = await Chat.findOne({
//       _id: req.params.chatId,
//       users: req.user.id,
//     });

//     if (chat) {
//       return next();
//     } else {
//       return res.status(401).json({
//         status: false,
//         message: "You are not authorized",
//       });
//     }
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({
//       status: false,
//       message: "Server error",
//     });
//   }
// }

module.exports = {
  authToken,
  passwordCheck,
  isAdmin,
  isPrincipal,
  isProxze,
  isOwnerPrincipal,
  isOwnerProxze,
  isPaid,
  isTaskUnassigned,
  // accessChat,
};
