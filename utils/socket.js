const xss = require("xss");
const path = require("path");
const socketIO = require("socket.io");

const sanitizeString = (str) => {
  return xss(str);
};

const handleSocketIO = (server) => {
  // const io = socketIO(server);
  const io = socketIO(server, {
    cors: {
      origin: "*", // Replace with the origin of your client application
      methods: ["GET", "POST"],
      allowedHeaders: ["my-custom-header"],
      credentials: true,
    },
  });

  const connections = {};
  const messages = {};
  const timeOnline = {};

  io.on("connection", (socket) => {
    socket.on("join-call", (path) => {
      if (connections[path] === undefined) {
        connections[path] = [];
      }
      connections[path].push(socket.id);

      timeOnline[socket.id] = new Date();

      for (let a = 0; a < connections[path].length; ++a) {
        io.to(connections[path][a]).emit(
          "user-joined",
          socket.id,
          connections[path]
        );
      }

      if (messages[path] !== undefined) {
        for (let a = 0; a < messages[path].length; ++a) {
          io.to(socket.id).emit(
            "chat-message",
            messages[path][a]["data"],
            messages[path][a]["sender"],
            messages[path][a]["socket-id-sender"]
          );
        }
      }

      console.log(path, connections[path]);
    });

    socket.on("signal", (toId, message) => {
      io.to(toId).emit("signal", socket.id, message);
    });

    socket.on("chat-message", (data, sender) => {
      data = sanitizeString(data);
      sender = sanitizeString(sender);

      var key;
      var ok = false;
      for (const [k, v] of Object.entries(connections)) {
        for (let a = 0; a < v.length; ++a) {
          if (v[a] === socket.id) {
            key = k;
            ok = true;
          }
        }
      }

      if (ok === true) {
        if (messages[key] === undefined) {
          messages[key] = [];
        }
        messages[key].push({
          sender: sender,
          data: data,
          "socket-id-sender": socket.id,
        });
        console.log("message", key, ":", sender, data);

        for (let a = 0; a < connections[key].length; ++a) {
          io.to(connections[key][a]).emit(
            "chat-message",
            data,
            sender,
            socket.id
          );
        }
      }
    });

    socket.on("disconnect", () => {
      var diffTime = Math.abs(timeOnline[socket.id] - new Date());
      var key;
      for (const [k, v] of JSON.parse(
        JSON.stringify(Object.entries(connections))
      )) {
        for (let a = 0; a < v.length; ++a) {
          if (v[a] === socket.id) {
            key = k;

            for (let a = 0; a < connections[key].length; ++a) {
              io.to(connections[key][a]).emit("user-left", socket.id);
            }

            var index = connections[key].indexOf(socket.id);
            connections[key].splice(index, 1);

            if (connections[key].length === 0) {
              delete connections[key];
            }
          }
        }
      }
    });
  });
};

module.exports = handleSocketIO;
