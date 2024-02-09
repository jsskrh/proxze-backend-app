const express = require("express");
const router = express.Router();

const Users = require("../controllers/users");
const Organization = require("../controllers/organization");

const auth = require("../middleware/index");

router.get(
  "/orgs/requests",
  auth.authToken,
  auth.isAccManager,
  Organization.getOrgReqs
);
router.put(
  "/orgs/requests/:reqId/:event",
  auth.authToken,
  auth.isAccManager,
  Organization.processOrgReq
);

module.exports = router;
