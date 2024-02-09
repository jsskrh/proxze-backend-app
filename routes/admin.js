const express = require("express");
const router = express.Router();

const Users = require("../controllers/users");
const Admin = require("../controllers/admin");

const auth = require("../middleware/index");

router.get("/users", auth.authToken, auth.isAdmin, Admin.getUsers);
router.get("/dashboard", auth.authToken, auth.isAdmin, Admin.getDashboard);

module.exports = router;
