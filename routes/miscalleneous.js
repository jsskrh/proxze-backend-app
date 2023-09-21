const express = require("express");
const router = express.Router();

const Miscalleneous = require("../controllers/miscalleneous");

const auth = require("../middleware/index");

router.post("/wake-server", Miscalleneous.wakeServer);

module.exports = router;
