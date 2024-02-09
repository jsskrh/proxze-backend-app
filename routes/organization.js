const express = require("express");
const router = express.Router();

const Organization = require("../controllers/organization");

const auth = require("../middleware/index");

router.get(
  "/requests",
  auth.authToken,
  auth.isPrincipal,
  Organization.getOrgReq
);
router.post(
  "/requests",
  auth.authToken,
  auth.isPrincipal,
  Organization.createOrgReq
);
router.get("/orgs", auth.authToken, auth.isPrincipal, Organization.getOrgs);
router.put(
  "/orgs/:orgId/members/accept",
  auth.authToken,
  auth.isOrgMember,
  Organization.acceptMembership
);
router.put(
  "/orgs/:orgId/members/reject",
  auth.authToken,
  auth.isOrgMember,
  Organization.rejectMembership
);
router.get(
  "/orgs/:orgId",
  auth.authToken,
  auth.isOrgMember,
  Organization.getOrg
);
router.post(
  "/orgs/:orgId/login",
  auth.authToken,
  auth.isOrgMember,
  Organization.orgLogin
);
router.put("/orgs/:orgId/members", auth.orgToken, Organization.addMember);
// router.post("/:id/task", auth.authToken, Organization.createBulkJob);
// router.get("/:id/task", auth.authToken, Organization.getAllBulkJobs);
// router.put(
//   "/:id/task/:jobId/accept",
//   auth.authToken,
//   Organization.acceptBulkJob
// );
// router.put(
//   "/:id/task/:jobId/reject",
//   auth.authToken,
//   Organization.removeBulkJob
// );
// router.get("/:id/task/:jobId", auth.authToken, Organization.getBulkJob);
// router.delete("/:id/task/:jobId", auth.authToken, Organization.deleteBulkJob);

module.exports = router;
