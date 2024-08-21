const express = require("express");
const router = express.Router();

const Users = require("../controllers/users");
const Admin = require("../controllers/admin");

const auth = require("../middleware/index");

router.get("/users", auth.authToken, auth.isAdmin, Admin.getUsers);
router.get("/users/:userId", auth.authToken, auth.isSuperProxze, Admin.getUser);
router.patch(
  "/users/:userId/super-perc",
  auth.authToken,
  auth.isAdmin,
  Admin.updateSuperPerc
);
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
router.patch(
  "/users/:userId/user-type",
  auth.authToken,
  auth.isAdmin,
  Admin.makeAdmin
);
router.get("/tasks", auth.authToken, auth.isAdmin, Admin.getTasks);
router.get(
  "/transactions",
  auth.authToken,
  auth.isAdmin,
  Admin.getTransactions
);
router.get("/dashboard", auth.authToken, auth.isAdmin, Admin.getDashboard);
router.patch(
  "/bulk/users/deactivate-nin",
  auth.authToken,
  auth.isAdmin,
  Admin.deleteUnverifiedNinUsers
);
router.patch(
  "/bulk/users/verify-email",
  auth.authToken,
  auth.isAdmin,
  Admin.bulkEmailVerification
);
router.patch(
  "/bulk/users/verify-nin",
  auth.authToken,
  auth.isAdmin,
  Admin.bulkNinVerification
);

module.exports = router;
