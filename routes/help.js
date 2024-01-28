const express = require("express");
const router = express.Router();

const Help = require("../controllers/help");

const auth = require("../middleware/index");

router.post("/topics", auth.authToken, Help.createTopic);
router.get("/topics", Help.getTopics);
router.post("/topics/documents", auth.authToken, Help.createDoc);
router.get("/topics/documents", Help.getDocs);
router.post("/question-hub", auth.authToken, Help.createQuestionTopic);
router.get("/question-hub", Help.getQuestionTopics);
router.post(
  "/question-hub/question/:topicId",
  auth.authToken,
  Help.createHelpOption
);
router.get("/question-hub/question", Help.getHelpOptions);

module.exports = router;
