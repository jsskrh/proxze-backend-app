const express = require("express");
const router = express.Router();
const Permission = require("../../controllers/business/permission");

router.post("/", Permission.createPermission);
router.patch("/:id", Permission.updatePermission);
router.delete("/:id", Permission.deletePermission);
router.get("/:id", Permission.getPermissionById);
router.get(
  "/principal/:principalId",
  Permission.getAllPermissionsByPrincipalId
);

module.exports = router;
