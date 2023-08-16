const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const userRoutes = require("./routes/users");
const taskRoutes = require("./routes/tasks");
// const chatRoutes = require("./routes/chats");
// const streamRoutes = require("./routes/stream");
// const ticketRoutes = require("./routes/tickets");
// const reviewsRoutes = require("./routes/reviews");
// const messageRoutes = require("./routes/messages");
// const paystackRoutes = require("./routes/paystack");
// const transactionRoutes = require("./routes/transactions");
// const settingsRoutes = require("./routes/settings");
const { billingAlgorithmSeeder } = require("./utils/seed/billingAlgorithm");
dotenv.config();

const app = express();

app.use(express.json());

const corsOptions = {
  origin: "*",
  // origin: "http://localhost:5173",
};

app.use(cors(corsOptions));

const uri =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/my_proxzi_app";

mongoose.set("strictQuery", false);
mongoose
  .connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Successfully connected to Database.");
    // billingAlgorithmSeeder();
  })
  .catch((err) => {
    console.log("Unable to connect to Database.", err);
  });

app.use("/api/user", userRoutes);
app.use("/api/task", taskRoutes);
// app.use("/api/chat", chatRoutes);
// app.use("/api/message", messageRoutes);
// app.use("/api/ticket", ticketRoutes);
// app.use("/api/review", reviewsRoutes);
// app.use("/api/stream", streamRoutes);
// app.use("/api/paystack", paystackRoutes);
// app.use("/api/transaction", transactionRoutes);
// app.use("/api/settings", settingsRoutes);

module.exports = app;
