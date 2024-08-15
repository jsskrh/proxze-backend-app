const express = require("express");
const router = express.Router();

const Users = require("../controllers/users");
const Super = require("../controllers/super");

const auth = require("../middleware/index");

router.post("/users", auth.authToken, auth.isSuperProxze, Super.addProxze);
router.post(
  "/users/bulk",
  auth.authToken,
  auth.isSuperProxze,
  Super.addBulkProxze
);
router.get("/users", auth.authToken, auth.isSuperProxze, Super.getSubProxzes);
router.patch(
  "/users/:userId/approve",
  auth.authToken,
  auth.isSuperProxze,
  Super.approveProxze
);
router.patch(
  "/users/:userId/reject",
  auth.authToken,
  auth.isSuperProxze,
  Super.rejectProxze
);

module.exports = router;
