const express = require("express");
const router = express.Router();
const Group = require("../../controllers/business/group");

router.post("/", Group.createGroup);
router.patch("/:id", Group.updateGroup);
router.delete("/:id", Group.deleteGroup);
router.get("/:id", Group.getGroupById);
router.get("/principal/:principalId", Group.getAllGroupsByPrincipalId);
router.post("/proxze/addProxze", Group.addSingleProxzeToGroup);
router.post("/proxze/addBulkProxze", Group.addBulkProxzeToGroup);
router.get("/group/proxze", Group.getGroupProxzes);

module.exports = router;
