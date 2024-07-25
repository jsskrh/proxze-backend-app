const express = require("express");
const router = express.Router();
const Group = require("../../controllers/business/group");

router.post("/", Group.createGroup);
router.patch("/:id", Group.updateGroup);
router.delete("/:id", Group.deleteGroup);
router.get("/:id", Group.getGroupById);
router.get("/principal/:principalId", Group.getAllGroupsByPrincipalId);

module.exports = router;
