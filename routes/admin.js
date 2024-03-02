const express = require("express");
const router = express.Router();

const Users = require("../controllers/users");
const Admin = require("../controllers/admin");

const auth = require("../middleware/index");

router.get("/users", auth.authToken, auth.isAdmin, Admin.getUsers);
router.get("/users/:userId", auth.authToken, auth.isAdmin, Admin.getUser);
router.patch(
  "/users/:userId/deactivate",
  auth.authToken,
  auth.isAdmin,
  Admin.deactivateAccount
);
router.delete(
  "/users/:userId/delete",
  auth.authToken,
  auth.isAdmin,
  Admin.deleteAccount
);
router.get("/tasks", auth.authToken, auth.isAdmin, Admin.getTasks);
router.get("/dashboard", auth.authToken, auth.isAdmin, Admin.getDashboard);

module.exports = router;
