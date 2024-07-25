const express = require("express");
const router = express.Router();
const Archive = require("../../controllers/business/archive");

router.post("/", Archive.createArchive);
router.patch("/:id", Archive.updateArchive);
router.delete("/:id", Archive.deleteArchive);
router.get("/:id", Archive.getArchiveById);
router.get("/principal/:principalId", Archive.getAllArchivesByPrincipalId);

module.exports = router;
