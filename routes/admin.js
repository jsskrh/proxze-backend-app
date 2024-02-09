const express = require("express");
const router = express.Router();

const Users = require("../controllers/users");

const auth = require("../middleware/index");

router.get("/users", auth.authToken, auth.isAdmin, Users.getUsers);
router.get("/dashboard", auth.authToken, auth.isAdmin);

module.exports = router;
