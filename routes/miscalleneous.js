const express = require("express");
const router = express.Router();

const Miscalleneous = require("../controllers/miscalleneous");

const auth = require("../middleware/index");

router.get("/wake-server", Miscalleneous.wakeServer);

module.exports = router;
