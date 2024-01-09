const express = require("express");
const router = express.Router();

const Users = require("../controllers/users");

const auth = require("../middleware/index");

router.get("/users", auth.authToken, Users.getUsers);

module.exports = router;
