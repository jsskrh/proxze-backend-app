const express = require("express");
const router = express.Router();

const Chats = require("../controllers/chats");

const auth = require("../middleware/index");

router.get("/", auth.authToken, Chats.getAllChats);
router.post(
  "/create/:taskId",
  auth.authToken,
  auth.isPrincipal,
  auth.isOwnerPrincipal,
  Chats.createChat
);
router.get("/view/:chatId", auth.authToken, auth.accessChat, Chats.getChat);
router.put("/view/:chatId", auth.authToken, auth.accessChat, Chats.sendMessage);
router.get("/unseen", auth.authToken, Chats.getUnseenChats);
router.put("/seen", auth.authToken, Chats.setToSeen);
router.put(
  "/view/:chatId/read",
  auth.authToken,
  auth.accessChat,
  Chats.setToRead
);

module.exports = router;
