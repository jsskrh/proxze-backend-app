const express = require("express");
const router = express.Router();
const Request = require("../../controllers/business/request");

router.post("/", Request.createRequest);
router.patch("/:id", Request.updateRequest);
router.delete("/:id", Request.deleteRequest);
router.get("/:id", Request.getRequestById);
router.get("/task/:id", Request.getTasksByRequestId);
router.get("/principal/:principalId", Request.getAllRequestsByPrincipalId);

module.exports = router;
