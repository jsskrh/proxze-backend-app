const express = require("express");
const router = express.Router();

const Users = require("../controllers/users");
const Super = require("../controllers/super");

const auth = require("../middleware/index");

router.post("/users", auth.authToken, auth.isSuperProxze, Super.addProxze);
router.get("/users", auth.authToken, auth.isSuperProxze, Super.getSubProxzes);

module.exports = router;
