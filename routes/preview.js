const express = require("express");
const router = express.Router();

const Preview = require("../controllers/preview");

const auth = require("../middleware/index");

router.get("/:taskId", Preview.previewTask);

module.exports = router;
