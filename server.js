const app = require("./app");
const http = require("http");
const { Server } = require("socket.io");

const PORT = process.env.PORT || 5000;

// const server = app.listen(PORT, () => {
//   console.log(`Server listening on port ${PORT}`);
// });

const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("connected");

  socket.on("setup", (userData) => {
    console.log(userData.id);
    socket.join(userData.id);
    socket.emit("connected");
  });

  socket.on("join chat", (chat) => {
    socket.join(chat);
    console.log(`User joined chat: ${chat}`);
  });

  socket.on("new text", (newTextRecieved, activeConversation) => {
    let chat = activeConversation;

    if (!chat.users) return console.log("chat.users not defined");

    const reciever = chat.users.find(
      (user) => user._id !== newTextRecieved.sender
    )._id;

    console.log("reciever", reciever);
    // socket.to(chat._id).emit("message recieved", newTextRecieved);

    chat.users.forEach((user) => {
      if (user._id === newTextRecieved.sender) return;

      socket.in(user._id).emit("message recieved", newTextRecieved);
    });
  });

  socket.off("setup", () => {
    console.log("User disconnnected");
    socket.leave(userData.id);
  });
});
