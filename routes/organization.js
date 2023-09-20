const express = require("express");
const router = express.Router();

const Organization = require("../controllers/organization");

const auth = require("../middleware/index");

router.post("/", auth.authToken, Organization.createOrg);
router.get("/", auth.authToken, Organization.getOrgs);
router.get("/:id", auth.authToken, Organization.getOrg);
router.post("/:id/members", auth.authToken, Organization.addMember);
router.post("/:id/task", auth.authToken, Organization.createBulkJob);
router.get("/:id/task", auth.authToken, Organization.getAllBulkJobs);
router.put(
  "/:id/task/:jobId/accept",
  auth.authToken,
  Organization.acceptBulkJob
);
router.put(
  "/:id/task/:jobId/reject",
  auth.authToken,
  Organization.removeBulkJob
);
router.get("/:id/task/:jobId", auth.authToken, Organization.getBulkJob);
// router.delete("/:id/task/:jobId", auth.authToken, Organization.deleteBulkJob);

module.exports = router;
