const express = require("express");
const router = express.Router();

const Preview = require("../controllers/preview");

const auth = require("../middleware/index");

router.get("/:token", Preview.previewTask);

module.exports = router;
