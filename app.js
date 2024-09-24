const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const path = require("path");
const userRoutes = require("./routes/users");
const adminRoutes = require("./routes/admin");
const superRoutes = require("./routes/super");
const staffRoutes = require("./routes/staff");
const taskRoutes = require("./routes/tasks");
const previewRoutes = require("./routes/preview");
const chatRoutes = require("./routes/chats");
const helpRoutes = require("./routes/help");
// const streamRoutes = require("./routes/stream");
// const ticketRoutes = require("./routes/tickets");
// const reviewsRoutes = require("./routes/reviews");
// const paystackRoutes = require("./routes/paystack");
// const settingsRoutes = require("./routes/settings");
const transactionRoutes = require("./routes/transactions");
const organizationRoutes = require("./routes/organization");
const notificationRoutes = require("./routes/notifications");
const miscalleneousRoutes = require("./routes/miscalleneous");
const { billingAlgorithmSeeder } = require("./utils/seed/billingAlgorithm");
const { configSeeder } = require("./utils/seed/config");
const { verificationSeeder } = require("./utils/seed/verification");
const { default: axios } = require("axios");
dotenv.config;

// ----- PROXZE BUSINESS -----
const groupRoutes = require("./routes/business/group");
const requestRoutes = require("./routes/business/request");
const archiveRoutes = require("./routes/business/archive");
const permissionRoutes = require("./routes/business/permission");
const subscriptionRoutes = require("./routes/business/subscription");
const { assignSuperTokens } = require("./utils/seed/superToken");
const { assignPhoneTokens } = require("./utils/seed/phoneToken");

const app = express();

app.use(express.json());

const tlsCAFilePath = path.resolve(__dirname, "global-bundle.pem");

const corsOptions = {
  origin: "*",
  // origin: "http://localhost:5173",
};

app.use(cors(corsOptions));

const uri = process.env.MONGODB_URI;

mongoose.set("strictQuery", false);
mongoose
  .connect(uri, {
    serverSelectionTimeoutMS: 60000,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // tls: true,
    // tlsCAFile: tlsCAFilePath,
  })
  .then(() => {
    console.log("Successfully connected to Database.");
    // if (process.env.ENVIRONMENT === "prod") verificationSeeder();
    configSeeder();
    assignSuperTokens();
    assignPhoneTokens();
  })
  .catch((err) => {
    console.error("Unable to connect to Database.", err);
  });

app.get("/hello", (req, res) => {
  res.send("Hello World!");
});
app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/super", superRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/task", taskRoutes);
app.use("/api/preview", previewRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/notification", notificationRoutes);
app.use("/api/organization", organizationRoutes);
app.use("/api/miscalleneous", miscalleneousRoutes);
app.use("/api/help", helpRoutes);
// app.use("/api/review", reviewsRoutes);
// app.use("/api/stream", streamRoutes);
// app.use("/api/paystack", paystackRoutes);
app.use("/api/transaction", transactionRoutes);
// app.use("/api/settings", settingsRoutes);

// ----- PROXZE BUSINESS -----
app.use("/business/users", userRoutes);
app.use("/business/groups", groupRoutes);
app.use("/business/requests", requestRoutes);
app.use("/business/archives", archiveRoutes);
app.use("/business/permissions", permissionRoutes);
app.use("/business/subscriptions", subscriptionRoutes);
app.use("/business/task", taskRoutes);

module.exports = app;
