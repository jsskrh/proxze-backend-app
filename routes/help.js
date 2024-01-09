const express = require("express");
const router = express.Router();

const Topics = require("../controllers/topics");

const auth = require("../middleware/index");

router.post("/topics", auth.authToken, Topics.createTopic);

module.exports = router;
